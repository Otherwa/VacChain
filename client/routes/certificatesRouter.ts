import express, { type Request, type Response } from "express";
import multer from "multer";
import path from "path";
import User from "../model/user";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const hashName = generateHashName();
    const extension = path.extname(file.originalname);
    cb(null, `${hashName}${extension}`);
  },
});

const upload = multer({ storage: storage });

function generateHashName() {
  const currentDate = new Date().toISOString().replace(/[-:.]/g, "");
  const randomString = Math.random().toString(36).substring(7);
  return `${currentDate}_${randomString}_`;
}

router.get("/upload", (req, res) => {
  res.render("upload");
});

router.post(
  "/upload",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const uploadedFile = req.file;

      if (!uploadedFile) {
        return res.status(400).send("No file uploaded");
      }

      // ! Bug
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).send("Unauthorized");
      }

      const hashName = generateHashName();
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).send("User not found");
      }

      user.certifactetransaction.push(hashName);
      await user.save();

      res.send("Certificate uploaded successfully!");
    } catch (error) {
      console.error("Error uploading certificate:", error);
      res.status(500).send("Error uploading certificate");
    }
  }
);

router.get("/view", (req, res) => {
  res.render("view");
});

export default router;
