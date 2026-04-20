import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";

import { initSocket } from "./controllers/socketManager.js";
import { register, login } from "./controllers/user.controller.js";

dotenv.config();

const app = express();
const server = createServer(app);

// initialize socket
initSocket(server);

const PORT = process.env.PORT || 8080;

// Configure CORS for different environments
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from:
    // 1. GitHub Codespaces (any port on the same domain)
    // 2. Localhost (for local development)
    // 3. Production URLs
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:3000',
      /github\.dev$/, // Allow all github.dev subdomains
      'https://videocalling-backend-s5ek.onrender.com',
    ];

    // If no origin header (like in mobile apps), allow it
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin matches allowed list
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware 
app.use(cors(corsOptions));
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));


app.get("/", (req, res) => {
  res.send("🚀 Backend server is running");
});


const router = express.Router();

router.post("/register", register);
router.post("/login", login);

app.use("/api", router);

//  Start Server 
const startServer = async () => {
  try {
    await mongoose.connect(process.env.ATLASDB_URL);

    console.log("✅ MongoDB Connected");

    server.listen(PORT, () => {
      console.log(` -- Server running at: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(" !--! Server start error:", error);
  }
};

startServer();
