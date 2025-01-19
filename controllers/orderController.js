const { ordini, users, prodotti } = require("../models");
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

module.exports = {
  createOrder,
  getOrdersByDate,
  deleteOrder,
};
