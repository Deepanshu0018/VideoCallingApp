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

// Middleware 
app.use(cors());
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
