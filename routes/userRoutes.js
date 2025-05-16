const express = require("express");
const {
  login,
  checkAuth,
  getAllUsers,
  enableUser,
  disableUser,
  updateProfile,
  changePassword,
} = require("../controllers/userController");
const {
  verifyToken,
  isAdmin,
  checkDuplicateEmailOrUsername,
} = require("../middlewares/authMiddleware");
const { users, roles } = require("../models");

const router = express.Router();

// Ora getAllUsers è definito e può essere usato come middleware
// router.get("/", verifyToken, isAdmin, getAllUsers);

router.post("/login", login);

router.get("/check-auth", verifyToken, checkAuth);

router.post("/logout", verifyToken, (req, res) => {
  try {
    // Se stai usando un blacklist per i token invalidati
    // puoi aggiungere qui il token corrente alla blacklist
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.json({
      success: true,
      message: "Logout effettuato con successo",
    });
  } catch (error) {
    console.error("Errore durante il logout:", error.stack);
    res.status(500).json({
      message: "Errore durante il logout",
      error: error.message,
    });
  }
});

// Registrazione (verifica duplicati)
router.post("/signup", checkDuplicateEmailOrUsername, async (req, res) => {
  try {
    const { username, email, password, role_id } = req.body;

    let finalRoleId = role_id;

    if (role_id) {
      const roleExists = await roles.findByPk(role_id);
      if (!roleExists) {
        finalRoleId = 2;
      }
    } else {
      finalRoleId = 2;
    }

    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await users.create({
      username,
      email,
      password: hashedPassword,
      role_id: finalRoleId,
      valid: true,
    });

    res.status(201).json({
      message: "Utente registrato con successo",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role_id: newUser.role_id || "seller",
      },
    });
  } catch (error) {
    console.error("Errore durante la registrazione:", error.stack);
    res
      .status(500)
      .json({ message: "Errore del server", error: error.message });
  }
});

router.get("/", verifyToken, isAdmin, getAllUsers);
router.put("/:id/disable", verifyToken, isAdmin, disableUser);
router.put("/:id/enable", verifyToken, isAdmin, enableUser);
router.put("/updateProfile", verifyToken, updateProfile);
router.put("/change-password", verifyToken, changePassword);

module.exports = router;
