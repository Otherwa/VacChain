import express, { type Request, type Response } from "express";
import multer from "multer";
import path from "path";
import User from "../model/user";

const router = express.Router();

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Specify the directory where uploaded files should be stored
  },
  filename: function (req, file, cb) {
    // Generate a unique filename for the uploaded file with hash name and date-time
    const hashName = generateHashName();
    const extension = path.extname(file.originalname);
    cb(null, `${hashName}${extension}`);
  },
});

// Create the multer instance
const upload = multer({ storage: storage });

// Helper function to generate a unique hash name based on current date and time
function generateHashName() {
  const currentDate = new Date().toISOString().replace(/[-:.]/g, "");
  const randomString = Math.random().toString(36).substring(7);
  return `${currentDate}_${randomString}_`;
}

router.get("/upload", (req, res) => {
  // Render the upload certificates page
  res.render("upload");
});

// Route for handling file uploads
// Route for handling file uploads
router.post(
  "/upload",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      // Access the uploaded file details
      const uploadedFile = req.file;

      if (!uploadedFile) {
        return res.status(400).send("No file uploaded");
      }

      // Find the current user based on some identifier
      // ! Bug
      const userId = req.user?.id; // Assuming you have user authentication and the user ID is available in req.user

      if (!userId) {
        return res.status(401).send("Unauthorized");
      }

      // Push the generated hash name into the user's certificate transaction array
      const hashName = generateHashName(); // Generate the hash name
      const user = await User.findById(userId); // Find the user by ID

      if (!user) {
        return res.status(404).send("User not found");
      }

      user.certifactetransaction.push(hashName); // Push the hash name into the certificate transaction array
      await user.save(); // Save the user document with the updated certificate transaction array

      res.send("Certificate uploaded successfully!");
    } catch (error) {
      console.error("Error uploading certificate:", error);
      res.status(500).send("Error uploading certificate");
    }
  }
);

router.get("/view", (req, res) => {
  // Render the view certificates page
  res.render("view");
});

export default router;
