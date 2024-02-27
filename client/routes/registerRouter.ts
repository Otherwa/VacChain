import express from "express";
import User from "../model/user";
import CryptoJS from "crypto-js"; // Import CryptoJS
const router = express.Router();

router.get("/register", (req, res) => {
  // Render the register page
  res.render("register");
});

router.post("/register", async (req, res) => {
  try {
    console.log(req.body);
    const { username, email, password } = req.body;

    // Generate public and private keys using CryptoJS
    const privateKey = CryptoJS.lib.WordArray.random(32).toString(
      CryptoJS.enc.Hex
    );
    const publicKey = CryptoJS.lib.WordArray.random(32).toString(
      CryptoJS.enc.Hex
    );

    // Create a new user object with the generated keys
    const newUser = new User({
      username,
      email,
      password,
      priKey: privateKey,
      pubKey: publicKey,
    });

    // Save the user to the database
    await newUser.save();

    res.send("User registered successfully!");
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send("An error occurred while registering the user.");
  }
});

export default router;
