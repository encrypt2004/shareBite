const API_BASE = "/api";

const serializeListing = (doc, serializeTimestamp) => {
	const data = doc.data();
	return {
		id: doc.id,
		...data,
		created_at: serializeTimestamp(data?.created_at),
		pickup_window_start: serializeTimestamp(data?.pickup_window_start),
		pickup_window_end: serializeTimestamp(data?.pickup_window_end),
	};
};

const registerListingRoutes = (app, deps) => {
	const { db, serializeTimestamp, authMiddleware, requireRole } = deps;

	app.post(`${API_BASE}/listings`, authMiddleware, requireRole("provider"), async (req, res) => {
		try {
			const {
				food_type,
				quantity,
				quality,
				pickup_window_start,
				pickup_window_end,
				location,
				description = "",
			} = req.body || {};

			if (!food_type || !quantity || !pickup_window_start || !pickup_window_end || !location) {
				return res.status(400).json({ message: "Missing required listing fields" });
			}

			const now = new Date();
			const docRef = db.collection("listings").doc();
			const payload = {
				id: docRef.id,
				provider_id: req.user.id,
				provider_name: req.user.name,
				provider_phone: req.user.phone,
				food_type,
				quantity,
				quality,
				pickup_window_start: new Date(pickup_window_start),
				pickup_window_end: new Date(pickup_window_end),
				location,
				description,
				status: "available",
				created_at: now,
			};

			await docRef.set(payload);

			return res.status(201).json(serializeListing(await docRef.get(), serializeTimestamp));
		} catch (err) {
			console.error("POST /listings error", err);
			return res.status(500).json({ message: "Failed to create listing" });
		}
	});

	app.get(`${API_BASE}/listings`, async (req, res) => {
		try {
			const { status = "available" } = req.query;
			let query = db.collection("listings");
			if (status) {
				query = query.where("status", "==", status);
			}
			query = query.orderBy("created_at", "desc");

			const snap = await query.get();
			const items = snap.docs.map((doc) => serializeListing(doc, serializeTimestamp));
			return res.json(items);
		} catch (err) {
			console.error("GET /listings error", err);
			return res.status(500).json({ message: "Failed to fetch listings" });
		}
	});

	app.get(`${API_BASE}/listings/my`, authMiddleware, requireRole("provider"), async (req, res) => {
		try {
			const snap = await db
				.collection("listings")
				.where("provider_id", "==", req.user.id)
				.orderBy("created_at", "desc")
				.get();
			const items = snap.docs.map((doc) => serializeListing(doc, serializeTimestamp));
			return res.json(items);
		} catch (err) {
			console.error("GET /listings/my error", err);
			return res.status(500).json({ message: "Failed to fetch provider listings" });
		}
	});

	app.get(`${API_BASE}/listings/:id`, async (req, res) => {
		try {
			const doc = await db.collection("listings").doc(req.params.id).get();
			if (!doc.exists) {
				return res.status(404).json({ message: "Listing not found" });
			}
			return res.json(serializeListing(doc, serializeTimestamp));
		} catch (err) {
			console.error("GET /listings/:id error", err);
			return res.status(500).json({ message: "Failed to fetch listing" });
		}
	});
};

module.exports = {
	registerListingRoutes,
};
