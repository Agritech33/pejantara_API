const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const emailCheckQuery = `SELECT * FROM users WHERE email = ?`;
    const [emailCheckResults] = await db.query(emailCheckQuery, [email]);

    if (emailCheckResults.length > 0) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
    await db.query(query, [name, email, hashedPassword]);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const query = `SELECT * FROM users WHERE email = ?`;
    const [results] = await db.query(query, [email]);

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
