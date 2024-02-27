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
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).send("User not found");
    }

    const passwordMatch = password == user.password ? true : false;

    if (!passwordMatch) {
      return res.status(401).send("Invalid password");
    }

    //  ! Bug
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      pubKey: user.pubKey,
      priKey: user.priKey,
    };

    res.send("Login successful!");
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
