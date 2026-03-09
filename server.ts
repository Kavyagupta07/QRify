import express from "express";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "qrify-secret-key-123";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://kavya:kavya123@cluster0.u65hfi3.mongodb.net/?appName=Cluster0";

// Database initialization
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Create models
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const qrSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  content: { type: String, required: true },
  redirectId: { type: String, required: true, unique: true },
  scanCount: { type: Number, default: 0 },
  expiryDate: { type: Date },
  password: { type: String },
  oneTimeUse: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const QR = mongoose.model('QR', qrSchema);

app.use(express.json());

// Middleware: Auth
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
};

// --- Auth Routes ---

app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id, email }, JWT_SECRET);
    res.status(201).json({ token, user: { id: user._id, name, email } });
  } catch (error: any) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- QR Routes ---

app.post("/api/qrs", authenticateToken, async (req: any, res) => {
  const { type, content, expiryDate, password, oneTimeUse } = req.body;
  const redirectId = crypto.randomBytes(4).toString("hex");

  try {
    const qr = new QR({
      userId: req.user.id,
      type,
      content,
      redirectId,
      expiryDate: expiryDate || null,
      password: password ? bcrypt.hashSync(password, 8) : null,
      oneTimeUse: oneTimeUse ? true : false
    });

    await qr.save();
    res.status(201).json({
      id: qr._id,
      userId: qr.userId,
      type: qr.type,
      content: qr.content,
      redirectId: qr.redirectId,
      scanCount: qr.scanCount,
      expiryDate: qr.expiryDate,
      password: qr.password,
      oneTimeUse: qr.oneTimeUse,
      createdAt: qr.createdAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create QR code" });
  }
});

app.get("/api/qrs", authenticateToken, async (req: any, res) => {
  try {
    const qrs = await QR.find({ userId: req.user.id }).sort({ createdAt: -1 });
    const formattedQrs = qrs.map(qr => ({
      id: qr._id,
      userId: qr.userId,
      type: qr.type,
      content: qr.content,
      redirectId: qr.redirectId,
      scanCount: qr.scanCount,
      expiryDate: qr.expiryDate,
      password: qr.password,
      oneTimeUse: qr.oneTimeUse,
      createdAt: qr.createdAt
    }));
    res.json(formattedQrs);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/qrs/:id", authenticateToken, async (req: any, res) => {
  try {
    const result = await QR.deleteOne({ _id: req.params.id, userId: req.user.id });

    if (result.deletedCount === 0) return res.status(404).json({ error: "QR not found" });
    res.json({ message: "QR deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Redirect Logic ---

app.get("/r/:redirectId", async (req, res) => {
  try {
    const qr = await QR.findOne({ redirectId: req.params.redirectId });

    if (!qr) return res.status(404).send("QR Code not found");

    // Check Expiry
    if (qr.expiryDate && new Date(qr.expiryDate) < new Date()) {
      return res.status(410).send("This QR code has expired.");
    }

    // Check One-Time Use (if already scanned)
    if (qr.oneTimeUse && qr.scanCount > 0) {
      return res.status(410).send("This is a one-time QR code and has already been used.");
    }

    // If password protected, we need to handle it on the frontend or a special page
    // For simplicity in this demo, if password exists, we redirect to a password verification page on the frontend
    if (qr.password) {
      return res.redirect(`/verify-qr/${qr.redirectId}`);
    }

    // Increment scan count
    qr.scanCount += 1;
    await qr.save();

    // Redirect to content (if it's a URL)
    if (qr.type === "url") {
      let url = qr.content;
      if (!/^https?:\/\//i.test(url)) {
        url = 'http://' + url;
      }
      return res.redirect(url);
    } else {
      // For other types, redirect to a display page
      return res.redirect(`/view-qr/${qr.redirectId}`);
    }
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

// API for verifying password-protected QR
app.post("/api/qrs/verify/:redirectId", async (req, res) => {
  try {
    const { password } = req.body;
    const qr = await QR.findOne({ redirectId: req.params.redirectId });

    if (!qr) return res.status(404).json({ error: "QR not found" });

    if (qr.expiryDate && new Date(qr.expiryDate) < new Date()) {
      return res.status(410).json({ error: "This QR code has expired." });
    }

    if (qr.oneTimeUse && qr.scanCount > 0) {
      return res.status(410).json({ error: "This is a one-time QR code and has already been used." });
    }

    if (!qr.password) return res.json({ success: true, content: qr.content, type: qr.type });

    const valid = await bcrypt.compare(password, qr.password);
    if (!valid) return res.status(401).json({ error: "Incorrect password" });

    // Increment scan count
    qr.scanCount += 1;
    await qr.save();

    res.json({ success: true, content: qr.content, type: qr.type });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// API for viewing non-URL QR content
app.get("/api/qrs/view/:redirectId", async (req, res) => {
  try {
    const qr = await QR.findOne({ redirectId: req.params.redirectId });
    if (!qr) return res.status(404).json({ error: "QR not found" });

    // We don't increment scan count here if it's password protected (that's handled in verify)
    // But if it's NOT password protected and we're viewing it, we should increment
    if (!qr.password) {
      qr.scanCount += 1;
      await qr.save();
    }

    res.json({ content: qr.content, type: qr.type, expiryDate: qr.expiryDate, oneTimeUse: qr.oneTimeUse, scanCount: qr.scanCount });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Vite middleware for frontend
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
