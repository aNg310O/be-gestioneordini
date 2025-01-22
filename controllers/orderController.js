const { ordini, users, prodotti, config, sequelize } = require("../models");
const { Op } = require("sequelize");

const createOrder = async (req, res) => {
  try {
    const { seller, prodotto_id, grammatura, qty, peso_totale, notes } =
      req.body;

    const newOrder = await ordini.create({
      seller,
      prodotto_id,
      grammatura,
      qty,
      peso_totale,
      notes,
      created_at: new Date(),
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Errore nella creazione dell'ordine:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};

const getOrdersByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const whereClause = {
      created_at: {
        [Op.gte]: startDate,
        [Op.lt]: endDate,
      },
    };

    if (req.user.role.role !== "admin") {
      whereClause.seller = req.user.username;
    }

    const orders = await ordini.findAll({
      where: whereClause,
      include: [
        { model: users, attributes: ["username"] },
        {
          model: prodotti,
          attributes: ["descrizione", "grammatura", "peso_totale"],
        },
      ],
    });

    res.json(orders);
  } catch (error) {
    console.error("Errore nel recupero degli ordini:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await ordini.findByPk(id);

    if (!order) {
      return res.status(404).json({ message: "Ordine non trovato" });
    }

    const today = new Date();
    const orderDate = new Date(order.created_at);

    if (
      today.getFullYear() !== orderDate.getFullYear() ||
      today.getMonth() !== orderDate.getMonth() ||
      today.getDate() !== orderDate.getDate()
    ) {
      return res
        .status(403)
        .json({ message: "Puoi cancellare solo gli ordini di oggi" });
    }

    await order.destroy();
    res.json({ message: "Ordine cancellato con successo" });
  } catch (error) {
    console.error("Errore nella cancellazione dell'ordine:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};

const getOrderCutoffHour = async (req, res) => {
  try {
    const cutoffConfig = await config.findOne({
      where: { name: "order_cutoff_hour" },
    });
    res.json({ cutoffHour: cutoffConfig.value });
  } catch (error) {
    console.error("Errore nel recupero del limite orario:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};

const updateOrderCutoffHour = async (req, res) => {
  try {
    const { cutoffHour } = req.body;
    const cutoffConfig = await config.findOne({
      where: { name: "order_cutoff_hour" },
    });

    if (cutoffConfig) {
      cutoffConfig.value = cutoffHour;
      await cutoffConfig.save();
      res.json({ message: "Limite orario aggiornato con successo" });
    } else {
      res.status(404).json({ message: "Configurazione non trovata" });
    }
  } catch (error) {
    console.error("Errore nell'aggiornamento del limite orario:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};

const getOrderTotalsByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const totals = await ordini.findAll({
      where: {
        created_at: {
          [Op.gte]: startDate,
          [Op.lt]: endDate,
        },
      },
      attributes: [
        "prodotto_id",
        "prodotti.grammatura",
        [sequelize.fn("SUM", sequelize.col("ordini.qty")), "total_qty"],
        [
          sequelize.fn("SUM", sequelize.col("ordini.peso_totale")),
          "total_weight",
        ],
      ],
      group: ["prodotto_id", "prodotti.grammatura", "prodotti.id"],
      include: [
        {
          model: prodotti,
          attributes: ["descrizione", "grammatura", "peso_totale"],
        },
      ],
      order: [
        [sequelize.col("prodotti.descrizione"), "ASC"],
        [sequelize.col("prodotti.grammatura"), "ASC"],
      ],
    });

    res.json(totals);
  } catch (error) {
    console.error("Errore nel recupero dei totali degli ordini:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};

const getOrderTotalsByMonth = async (req, res) => {
  try {
    const totals = await ordini.findAll({
      attributes: [
        [
          sequelize.fn(
            "DATE_TRUNC",
            "month",
            sequelize.col("ordini.created_at")
          ),
          "month",
        ],
        "prodotto_id",
        "prodotti.grammatura",
        [sequelize.fn("SUM", sequelize.col("ordini.qty")), "total_qty"],
        [
          sequelize.fn("SUM", sequelize.col("ordini.peso_totale")),
          "total_weight",
        ],
      ],
      group: ["month", "prodotto_id", "prodotti.grammatura", "prodotti.id"],
      include: [
        {
          model: prodotti,
          attributes: ["descrizione", "grammatura", "peso_totale"],
        },
      ],
      order: [
        [
          sequelize.fn(
            "DATE_TRUNC",
            "month",
            sequelize.col("ordini.created_at")
          ),
          "ASC",
        ],
        [sequelize.col("prodotti.descrizione"), "ASC"],
        [sequelize.col("prodotti.grammatura"), "ASC"],
      ],
    });

    res.json(totals);
  } catch (error) {
    console.error(
      "Errore nel recupero dei totali mensili degli ordini:",
      error
    );
    res.status(500).json({ message: "Errore del server" });
  }
};

const getAvailableMonths = async (req, res) => {
  try {
    const months = await ordini.findAll({
      attributes: [
        [
          sequelize.fn("DATE_TRUNC", "month", sequelize.col("created_at")),
          "month",
        ],
      ],
      group: ["month"],
      order: [
        [
          sequelize.fn("DATE_TRUNC", "month", sequelize.col("created_at")),
          "ASC",
        ],
      ],
    });

    res.json(months);
  } catch (error) {
    console.error("Errore nel recupero dei mesi disponibili:", error);
    res.status(500).json({ message: "Errore del server" });
  }
};

module.exports = {
  createOrder,
  getOrdersByDate,
  deleteOrder,
  getOrderCutoffHour,
  updateOrderCutoffHour,
  getOrderTotalsByDate,
  getOrderTotalsByMonth,
  getAvailableMonths,
};
