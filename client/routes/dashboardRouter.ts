import express from "express";
const router = express.Router();

router.get("/dashboard", (req, res) => {
  // ! Bug
  console.log(req.session?.user);
  res.render("dashboard");
});

export default router;
