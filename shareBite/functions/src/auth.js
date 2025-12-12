const API_BASE = "/api";

const normalizeRoles = (roles) => {
	if (!Array.isArray(roles)) return [];
	const allowed = ["provider", "ngo"];
	return roles.filter((r) => allowed.includes(r));
};

const signInWithPassword = async (apiKey, email, password) => {
	if (!apiKey) {
		throw new Error("Missing Firebase Web API key in functions config app.apikey");
	}

	const resp = await fetch(
		`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password, returnSecureToken: true }),
		}
	);

	const data = await resp.json();
	if (!resp.ok) {
		const message = data?.error?.message || "AUTH_SIGNIN_FAILED";
		const err = new Error(message);
		err.status = 400;
		throw err;
	}
	return data.idToken;
};

const toSafeUser = (profile, serializeTimestamp) => {
	if (!profile) return null;
	return {
		...profile,
		created_at: serializeTimestamp(profile.created_at),
	};
};

const registerAuthRoutes = (app, deps) => {
	const { admin, db, serializeTimestamp, authMiddleware } = deps;
	const apiKey = deps.config?.authApiKey;

	app.post(`${API_BASE}/auth/register`, async (req, res) => {
		try {
			const { email, password, name, phone = "", address = "", roles = [] } = req.body || {};
			const normalizedRoles = normalizeRoles(roles);

			if (!email || !password || !name) {
				return res.status(400).json({ message: "email, password, and name are required" });
			}
			if (normalizedRoles.length === 0) {
				return res.status(400).json({ message: "At least one role (provider or ngo) is required" });
			}

			let userRecord;
			try {
				userRecord = await admin.auth().createUser({
					email,
					password,
					displayName: name,
					phoneNumber: phone || undefined,
				});
			} catch (err) {
				const code = err?.errorInfo?.code || err?.code;
				if (code === "auth/email-already-exists") {
					return res.status(400).json({ message: "Email already registered" });
				}
				console.error("createUser error", err);
				return res.status(500).json({ message: "Failed to create user" });
			}

			const profile = {
				id: userRecord.uid,
				email,
				name,
				phone,
				address,
				roles: normalizedRoles,
				created_at: admin.firestore.Timestamp.now(),
			};

			await db.collection("users").doc(userRecord.uid).set(profile);

			let idToken;
			try {
				idToken = await signInWithPassword(apiKey, email, password);
			} catch (err) {
				console.error("signInWithPassword error", err);
				const status = err.status || 500;
				return res.status(status).json({ message: "Registration succeeded but sign-in failed" });
			}

			return res.status(201).json({
				access_token: idToken,
				token_type: "Bearer",
				user: toSafeUser(profile, serializeTimestamp),
			});
		} catch (err) {
			console.error("/auth/register error", err);
			return res.status(err.status || 500).json({ message: err.message || "Registration failed" });
		}
	});

	app.post(`${API_BASE}/auth/login`, async (req, res) => {
		try {
			const { email, password } = req.body || {};
			if (!email || !password) {
				return res.status(400).json({ message: "email and password are required" });
			}

			let idToken;
			try {
				idToken = await signInWithPassword(apiKey, email, password);
			} catch (err) {
				console.error("login signInWithPassword error", err);
				const status = err.status || 400;
				return res.status(status).json({ message: "Invalid credentials" });
			}

			const userRecord = await admin.auth().getUserByEmail(email).catch(() => null);
			if (!userRecord) {
				return res.status(404).json({ message: "User not found" });
			}

			const doc = await db.collection("users").doc(userRecord.uid).get();
			if (!doc.exists) {
				return res.status(404).json({ message: "User profile not found" });
			}

			const profile = toSafeUser({ id: doc.id, ...doc.data() }, serializeTimestamp);

			return res.json({
				access_token: idToken,
				token_type: "Bearer",
				user: profile,
			});
		} catch (err) {
			console.error("/auth/login error", err);
			return res.status(500).json({ message: "Login failed" });
		}
	});

	app.get(`${API_BASE}/auth/me`, authMiddleware, async (req, res) => {
		return res.json({ user: toSafeUser(req.user, serializeTimestamp) });
	});
};

module.exports = {
	registerAuthRoutes,
};
