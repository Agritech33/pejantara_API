const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET); // Get the token from "Bearer <token>"
    req.user = decoded; // Store the decoded token data (user info) in the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(400).json({ error: "Invalid token." });
  }
};
