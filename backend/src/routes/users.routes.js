import { Router } from "express";

const router = Router();

router.post("/login", (req, res) => {
  const { username } = req.body;

  res.status(200).json({
    message: "Login successful",
    token: "dummy-token",
    user: { username }
  });
});

router.post("/register", (req, res) => {
  const { name, username } = req.body;

  res.status(201).json({
    message: "Register successful",
    user: { name, username }
  });
});

router.get("/get_all_activity", (req, res) => {
  res.status(200).json({
    history: [
      { meeting_code: "ABC123", date: new Date() },
      { meeting_code: "XYZ456", date: new Date() }
    ]
  });
});

router.post("/add_to_activity", (req, res) => {
  const { meeting_code } = req.body;

  res.status(200).json({
    message: "Meeting added to history",
    meeting_code
  });
});

export default router;