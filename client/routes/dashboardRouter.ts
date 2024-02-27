import express from "express";
const router = express.Router();

router.get("/dashboard", (req, res) => {
  // Render the dashboard page
  console.log(req.session?.user);
  res.render("dashboard");
});

export default router;
