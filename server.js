const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use("/api/users", userRoutes);
app.use("/uploads", express.static("uploads"));

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
