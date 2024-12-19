const express = require("express");
const multer = require("multer");
const {
  registerUser,
  loginUser,
  updateProfilePhoto,
  getUserProfile,
} = require("../controllers/userController");
const { verifyToken } = require("../middleware/verifyToken");

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put(
  "/update-profile-photo",
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "backgroundPhoto", maxCount: 1 },
  ]),
  updateProfilePhoto
);
router.get("/me", verifyToken, getUserProfile);

module.exports = router;
