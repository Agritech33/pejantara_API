const db = require("../config/db");

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `SELECT id, name, email FROM users WHERE id = ?`;
    const [results] = await db.query(query, [userId]);

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = results[0];
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
