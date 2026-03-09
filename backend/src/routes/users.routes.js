import { Router } from "express";

const router = Router();

// login route
router.route("/login").post((req, res) => {
  res.json({
    message: "Login route working",
  });
});

//register
router.route("/register").post((req, res) => {
  res.json({
    message: "Register route working",
  });
});

export default router;
