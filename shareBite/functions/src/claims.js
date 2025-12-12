const API_BASE = "/api";

const serializeClaim = (doc, serializeTimestamp) => {
	const data = doc.data();
	return {
		id: doc.id,
		...data,
		claimed_at: serializeTimestamp(data?.claimed_at),
		quality_checked_at: serializeTimestamp(data?.quality_checked_at),
	};
};

const serializeNotification = (doc, serializeTimestamp) => {
	const data = doc.data();
	return {
		id: doc.id,
		...data,
		created_at: serializeTimestamp(data?.created_at),
	};
};

const registerClaimRoutes = (app, deps) => {
	const { db, serializeTimestamp, authMiddleware, requireRole } = deps;

	const notify = async ({ userId, message, type }) => {
		if (!userId) return null;
		const ref = db.collection("notifications").doc();
		const payload = {
			id: ref.id,
			user_id: userId,
			message,
			type: type || "info",
			read: false,
			created_at: new Date(),
		};
		await ref.set(payload);
		return payload;
	};

	app.post(`${API_BASE}/claims`, authMiddleware, requireRole("ngo"), async (req, res) => {
		try {
			const { listing_id } = req.body || {};
			if (!listing_id) {
				return res.status(400).json({ message: "listing_id is required" });
			}

			const listingRef = db.collection("listings").doc(listing_id);

			let claimDoc;
			await db.runTransaction(async (tx) => {
				const listingSnap = await tx.get(listingRef);
				if (!listingSnap.exists) {
					const err = new Error("Listing not found");
					err.status = 404;
					throw err;
				}
				const listing = listingSnap.data();
				if (listing.status !== "available") {
					const err = new Error("Listing is not available");
					err.status = 400;
					throw err;
				}

				const claimRef = db.collection("claims").doc();
				const now = new Date();
				const claimPayload = {
					id: claimRef.id,
					listing_id,
					provider_id: listing.provider_id,
					ngo_id: req.user.id,
					ngo_name: req.user.name,
					ngo_phone: req.user.phone,
					status: "claimed",
					claimed_at: now,
					quality_check_media: [],
				};

				tx.set(claimRef, claimPayload);
				tx.update(listingRef, { status: "claimed" });
				claimDoc = { ref: claimRef, data: claimPayload, listing };
			});

			// Notify provider
			await notify({
				userId: claimDoc.listing.provider_id,
				message: "Your listing has been claimed by an NGO.",
				type: "claim",
			});

			const claimSnap = await claimDoc.ref.get();
			const serialized = serializeClaim(claimSnap, serializeTimestamp);
			return res.status(201).json(serialized);
		} catch (err) {
			console.error("POST /claims error", err);
			const status = err.status || 500;
			return res.status(status).json({ message: err.message || "Failed to create claim" });
		}
	});

	app.get(`${API_BASE}/claims/my`, authMiddleware, requireRole("ngo"), async (req, res) => {
		try {
			const snap = await db
				.collection("claims")
				.where("ngo_id", "==", req.user.id)
				.orderBy("claimed_at", "desc")
				.get();

			const claims = await Promise.all(
				snap.docs.map(async (doc) => {
					const serialized = serializeClaim(doc, serializeTimestamp);
					const listingSnap = await db.collection("listings").doc(serialized.listing_id).get();
					serialized.listing = listingSnap.exists
						? {
								id: listingSnap.id,
								...listingSnap.data(),
								created_at: serializeTimestamp(listingSnap.data().created_at),
								pickup_window_start: serializeTimestamp(listingSnap.data().pickup_window_start),
								pickup_window_end: serializeTimestamp(listingSnap.data().pickup_window_end),
							}
						: null;
					return serialized;
				})
			);

			return res.json(claims);
		} catch (err) {
			console.error("GET /claims/my error", err);
			return res.status(500).json({ message: "Failed to fetch claims" });
		}
	});

	app.get(`${API_BASE}/claims/listing/:id`, authMiddleware, requireRole("provider"), async (req, res) => {
		try {
			const listingSnap = await db.collection("listings").doc(req.params.id).get();
			if (!listingSnap.exists) {
				return res.status(404).json({ message: "Listing not found" });
			}
			if (listingSnap.data().provider_id !== req.user.id) {
				return res.status(403).json({ message: "Not authorized for this listing" });
			}

			const snap = await db
				.collection("claims")
				.where("listing_id", "==", req.params.id)
				.orderBy("claimed_at", "desc")
				.get();
			const claims = snap.docs.map((doc) => serializeClaim(doc, serializeTimestamp));
			return res.json(claims);
		} catch (err) {
			console.error("GET /claims/listing/:id error", err);
			return res.status(500).json({ message: "Failed to fetch claims" });
		}
	});

	app.post(`${API_BASE}/claims/:id/quality-check`, authMiddleware, requireRole("ngo"), async (req, res) => {
		try {
			const { media_urls = [] } = req.body || {};
			if (!Array.isArray(media_urls)) {
				return res.status(400).json({ message: "media_urls must be an array" });
			}

			const claimRef = db.collection("claims").doc(req.params.id);
			const claimSnap = await claimRef.get();
			if (!claimSnap.exists) {
				return res.status(404).json({ message: "Claim not found" });
			}
			if (claimSnap.data().ngo_id !== req.user.id) {
				return res.status(403).json({ message: "Not authorized for this claim" });
			}

			const listingRef = db.collection("listings").doc(claimSnap.data().listing_id);

			const now = new Date();
			await db.runTransaction(async (tx) => {
				tx.update(claimRef, {
					status: "verified",
					quality_check_media: media_urls,
					quality_checked_at: now,
				});
				tx.update(listingRef, { status: "completed" });
			});

			// Notify provider about completion
			const listingSnap = await listingRef.get();
			await notify({
				userId: listingSnap.exists ? listingSnap.data().provider_id : null,
				message: "Claim verified and listing completed.",
				type: "quality_check",
			});

			const updated = await claimRef.get();
			return res.json(serializeClaim(updated, serializeTimestamp));
		} catch (err) {
			console.error("POST /claims/:id/quality-check error", err);
			return res.status(500).json({ message: "Failed to update quality check" });
		}
	});

	app.get(`${API_BASE}/notifications`, authMiddleware, async (req, res) => {
		try {
			const snap = await db
				.collection("notifications")
				.where("user_id", "==", req.user.id)
				.orderBy("created_at", "desc")
				.get();
			const items = snap.docs.map((doc) => serializeNotification(doc, serializeTimestamp));
			return res.json(items);
		} catch (err) {
			console.error("GET /notifications error", err);
			return res.status(500).json({ message: "Failed to fetch notifications" });
		}
	});

	app.post(`${API_BASE}/notifications/:id/read`, authMiddleware, async (req, res) => {
		try {
			const ref = db.collection("notifications").doc(req.params.id);
			const snap = await ref.get();
			if (!snap.exists) {
				return res.status(404).json({ message: "Notification not found" });
			}
			if (snap.data().user_id !== req.user.id) {
				return res.status(403).json({ message: "Not authorized" });
			}
			await ref.update({ read: true });
			const updated = await ref.get();
			return res.json(serializeNotification(updated, serializeTimestamp));
		} catch (err) {
			console.error("POST /notifications/:id/read error", err);
			return res.status(500).json({ message: "Failed to update notification" });
		}
	});
};

module.exports = {
	registerClaimRoutes,
};
