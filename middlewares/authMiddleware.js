const jwt = require("jsonwebtoken");
const { users, roles } = require("../models");

const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.jwt || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Autenticazione richiesta" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await users.findByPk(decoded.userId, {
      include: [
        {
          model: roles,
          attributes: ["role"],
        },
      ],
    });

    if (!user) {
      return res.status(401).json({ message: "Utente non trovato" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token non valido" });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.role || req.user.role.role !== "admin") {
      return res.status(403).json({ message: "Richiesto ruolo admin" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Errore del server" });
  }
};

const checkDuplicateEmailOrUsername = async (req, res, next) => {
  try {
    const { username, email } = req.body;

    // Verifica username
    const userByUsername = await users.findOne({ where: { username } });
    if (userByUsername) {
      return res.status(400).json({ message: "Username già in uso" });
    }

    // Verifica email
    const userByEmail = await users.findOne({ where: { email } });
    if (userByEmail) {
      return res.status(400).json({ message: "Email già in uso" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Errore del server" });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
  checkDuplicateEmailOrUsername,
};
