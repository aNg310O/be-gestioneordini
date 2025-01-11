const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { users, roles } = require("../models");

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await users.findOne({
      where: { username },
      include: [
        {
          model: roles,
          attributes: ["role"],
        },
      ],
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Credenziali non valide" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.cookie("jwt", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role.role,
      },
    });
  } catch (error) {
    console.error("Errore nel login:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};

const checkAuth = async (req, res) => {
  try {
    res.json({
      isAuthenticated: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role.role, // Assicurati che questo campo sia sempre presente
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Errore durante il check-auth",
    });
  }
};

module.exports = {
  login,
  checkAuth,
};
