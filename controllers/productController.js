// controllers/productController.js
const { prodotti } = require("../models");

const createProduct = async (req, res) => {
  try {
    const { descrizione, grammatura, pesoTotale } = req.body;

    const newProduct = await prodotti.create({
      descrizione,
      grammatura,
      peso_totale: pesoTotale,
      valid: true,
      created_at: new Date(),
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Errore nella creazione del prodotto:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};

module.exports = {
  createProduct,
};
