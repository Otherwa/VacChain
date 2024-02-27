import express, { type Request, type Response } from "express";
import User from "../model/user";
import bcrypt from "bcrypt";

const router = express.Router();

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Check if the provided password matches the stored password hash
    const passwordMatch = password == user.password ? true : false;

    if (!passwordMatch) {
      return res.status(401).send("Invalid password");
    }

    // Store user information in session
    // ! Bug
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      pubKey: user.pubKey,
      priKey: user.priKey,
      // Add other necessary user information here
    };

    res.send("Login successful!"); // or redirect to dashboard
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
