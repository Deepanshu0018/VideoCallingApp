import express, { Router } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { createServer } from "http";
import cors from "cors";
import { initSocket } from "./controllers/socketManager.js";
import { register } from "./controllers/user.controller.js";
import { User } from "./models/user.model.js";
import { login } from "./controllers/user.controller.js";

dotenv.config();

const app = express();
const server = createServer(app);
const io = initSocket(server);

const router = Router();

const PORT = process.env.PORT || 8080;

// middleware
app.use(cors());
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ limit: "50kb", extended: true }));

// routes
router.post("/register", register);
router.post("/login", login);

// attach router
app.use("/api", router);

// Server start
const startServer = async () => {
  try {
    await mongoose.connect(process.env.ATLASDB_URL);
    console.log("--MongoDB Connected--");

    server.listen(PORT, () => {
      console.log("--Server is running--");
      console.log(`http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server start error:", error);
  }
};

startServer();
