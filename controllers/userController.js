const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const path = require("path");

const registerUser = (req, res) => {
  const { name, email, password } = req.body;

  db.query("SELECT * FROM user WHERE email = ?", [email], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.length > 0)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.query(
      "INSERT INTO user (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword],
      (err, result) => {
        if (err)
          return res.status(500).json({ message: "Failed to register user" });

        const user = { id: result.insertId, name, email };
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        res
          .status(201)
          .json({ message: "User registered successfully", token });
      }
    );
  });
};

const loginUser = (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM user WHERE email = ?", [email], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.length === 0)
      return res.status(400).json({ message: "Invalid credentials" });

    const user = result[0];
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({ message: "Login successful", token });
  });
};

const updateProfilePhoto = (req, res) => {
  const { userId } = req.body;

  if (!req.files || !req.files.profilePhoto) {
    return res.status(400).json({ message: "No profile photo uploaded" });
  }

  const profilePhotoPath = req.files.profilePhoto[0].path;
  const backgroundPhotoPath = req.files.backgroundPhoto
    ? req.files.backgroundPhoto[0].path
    : null;

  const serverUrl = `${req.protocol}://${req.get("host")}`;
  const profilePhotoUrl = `${serverUrl}/${profilePhotoPath}`;
  const backgroundPhotoUrl = backgroundPhotoPath
    ? `${serverUrl}/${backgroundPhotoPath}`
    : null;

  const query =
    "UPDATE USER SET foto_profil = ?, foto_bg_profil = ? WHERE id = ?";
  db.query(
    query,
    [profilePhotoUrl, backgroundPhotoUrl, userId],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error updating profile photo", error: err });
      }

      res.status(200).json({
        message: "Profile updated successfully",
        foto_profil: profilePhotoUrl,
        foto_bg_profil: backgroundPhotoUrl || "No background photo uploaded",
      });
    }
  );
};

const getUserProfile = (req, res) => {
  const userId = req.user.id;

  db.query(
    "SELECT id, name, email, role, foto_profil, foto_bg_profil FROM user WHERE id = ?",
    [userId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const user = results[0];

      res.status(200).json({
        message: "User data retrieved successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          foto_profil: user.foto_profil,
          foto_bg_profil: user.foto_bg_profil,
        },
      });
    }
  );
};

module.exports = {
  registerUser,
  loginUser,
  updateProfilePhoto,
  getUserProfile,
};
