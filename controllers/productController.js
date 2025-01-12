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

const getAllProducts = async (req, res) => {
  try {
    const products = await prodotti.findAll();
    res.json(products);
  } catch (error) {
    console.error("Errore nel recupero dei prodotti:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};

const disableProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prodotti.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Prodotto non trovato" });
    }

    product.valid = false;
    await product.save();

    res.json({ message: "Prodotto disabilitato con successo" });
  } catch (error) {
    console.error("Errore nella disabilitazione del prodotto:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};

const enableProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prodotti.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Prodotto non trovato" });
    }

    product.valid = true;
    await product.save();

    res.json({ message: "Prodotto abilitato con successo" });
  } catch (error) {
    console.error("Errore nell'abilitazione del prodotto:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  disableProduct,
  enableProduct,
};
