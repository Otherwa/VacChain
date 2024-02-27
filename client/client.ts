import express, { type Request, type Response } from "express";
import path from "path";
import mongoose from "mongoose";
import session from "express-session";
import bodyParser from "body-parser"; // Import body-parser

import loginRouter from "./routes/loginRouter";
import registerRouter from "./routes/registerRouter";
import dashboardRouter from "./routes/dashboardRouter";
import certificatesRouter from "./routes/certificatesRouter";

const uri =
  "mongodb+srv://atharvdesai:hljUS0Xn6KPaKY3z@cluster0.smf3kdb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose
  .connect(uri, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log("Connected");
  })
  .catch((err) => console.log(err));

const app = express();
app.use(bodyParser.json()); // Add body-parser middleware to parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Add support for URL-encoded bodies

app.use(
  session({
    secret: "Tatakae", // Add a secret key for session encryption
    resave: false,
    saveUninitialized: true,
  })
);

// Set the view engine to EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Set up routes
app.use("/user/", loginRouter);
app.use("/user/", registerRouter);
app.use("/user/", dashboardRouter);
app.use("/user/", certificatesRouter);

// Define a route for handling GET requests to the root path
app.get("/", (req: Request, res: Response) => {
  res.render("index");
});

// Define a route for handling GET requests to the '/about' path
app.get("/about", (req: Request, res: Response) => {
  res.send("This is the about page!");
});

// Start the server
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 2000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
