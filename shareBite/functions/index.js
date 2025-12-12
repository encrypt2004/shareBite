const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

const {registerAuthRoutes} = require("./src/auth");
const {registerListingRoutes} = require("./src/listings");
const {registerClaimRoutes} = require("./src/claims");

admin.initializeApp();
const db = admin.firestore();

const config = functions.config() || {};
const frontendOrigin = config.app?.frontend_origin || "*";
const authApiKey = config.app?.apikey;

const allowedOrigins = frontendOrigin === "*"
  ? true
  : frontendOrigin.split(",").map((o) => o.trim()).filter(Boolean);

const app = express();
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

const serializeTimestamp = (value) => {
  if (!value) return value;
  if (value.toDate) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return value;
};

const loadUserProfile = async (uid) => {
  const doc = await db.collection("users").doc(uid).get();
  if (!doc.exists) return null;
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    created_at: serializeTimestamp(data?.created_at),
  };
};

const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing bearer token" });
  }
  const token = header.replace("Bearer ", "").trim();
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const profile = await loadUserProfile(decoded.uid);
    if (!profile) {
      return res.status(401).json({ message: "User profile not found" });
    }
    req.auth = decoded;
    req.user = profile;
    next();
  } catch (err) {
    console.error("authMiddleware error", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const requireRole = (roleOrRoles) => (req, res, next) => {
  const roles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
  const userRoles = req.user?.roles || [];
  const ok = roles.some((r) => userRoles.includes(r));
  if (!ok) {
    return res.status(403).json({ message: "Insufficient role" });
  }
  return next();
};

const deps = {
  admin,
  db,
  functions,
  serializeTimestamp,
  authMiddleware,
  requireRole,
  config: {
    frontendOrigin,
    authApiKey,
  },
};

registerAuthRoutes(app, deps);
registerListingRoutes(app, deps);
registerClaimRoutes(app, deps);

exports.api = functions.https.onRequest(app);
