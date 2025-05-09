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

    if (!user.valid) {
      return res.status(403).json({ message: "Account disabilitato" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
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

const getAllUsers = async (req, res) => {
  try {
    const allusers = await users.findAll({
      order: [["id", "ASC"]],
    });
    res.json(allusers);
  } catch (error) {
    console.error("Errore nel recupero degli utenti:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};

const disableUser = async (req, res) => {
  try {
    const { id } = req.params;
    const singleuser = await users.findByPk(id);

    if (!singleuser) {
      return res.status(404).json({ message: "Utente non trovato" });
    }

    singleuser.valid = false;
    await singleuser.save();

    res.json({ message: "Utente disabilitato con successo" });
  } catch (error) {
    console.error("Errore nella disabilitazione dell'utente:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};

const enableUser = async (req, res) => {
  try {
    const { id } = req.params;
    const singleuser = await users.findByPk(id);

    if (!singleuser) {
      return res.status(404).json({ message: "Utente non trovato" });
    }

    singleuser.valid = true;
    await singleuser.save();

    res.json({ message: "Utente abilitato con successo" });
  } catch (error) {
    console.error("Errore nell'abilitazione dell'utente:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user.id;

    const user = await users.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "Utente non trovato" });
    }

    user.email = email;
    await user.save();

    res.json({ message: "Profilo aggiornato con successo", user });
  } catch (error) {
    console.error("Errore nell'aggiornamento del profilo:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await users.findByPk(req.user.id);

    if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
      return res.status(401).json({ message: "Password attuale non corretta" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password aggiornata con successo" });
  } catch (error) {
    console.error("Errore nel cambio password:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};

module.exports = {
  login,
  checkAuth,
  getAllUsers,
  enableUser,
  disableUser,
  updateProfile,
  changePassword,
};
