const express = require("express");
const app = express();
const cors = require("cors");
const userRoutes = require("./routes/userroutes");
const postRoutes = require("../instabackend/routes/postroutes");
const storyRoutes = require("../instabackend/routes/storyroutes");
const connectToMongo = require("./db");
const env = require("dotenv");
const session = require("express-session");
const bodyParser = require("body-parser");
env.config();
//middlewares
// Increase the limit to 50MB, for example
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
// Allow requests from http://localhost:3001
app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: process.env.JWT_SECRET, // Change this to a random secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }, // Set to true for HTTPS
    maxAge: 60 * 60 * 1000,
  })
);
app.use("/api/user", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/stories", storyRoutes);
//invoke mongodb connection here
connectToMongo();

app.get("/", (req, res) => {
  res.send("hello instagram");
});
app.listen(process.env.PORT, () => {
  console.log(`app is listening at http://localhost:${process.env.PORT}`);
});
