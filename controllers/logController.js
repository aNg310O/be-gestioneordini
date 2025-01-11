const { log } = require("../models");
const { Op } = require("sequelize");

// Crea un nuovo log
const createLog = async (req, res) => {
  try {
    const newLog = await log.create(req.body);
    res.status(201).json(newLog);
  } catch (error) {
    console.error("Errore nella creazione del log:", error);
    res.status(500).send("Errore del server");
  }
};

// Ottieni tutti i log
const getLogs = async (req, res) => {
  try {
    const logs = await log.findAll();
    res.json(logs);
  } catch (error) {
    console.error("Errore nel recupero dei log:", error);
    res.status(500).send("Errore del server");
  }
};

// Ottieni i log filtrati per data
const getLogsByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const logs = await log.findAll({
      where: {
        created_at: {
          [Op.gte]: startDate,
          [Op.lt]: endDate,
        },
      },
    });

    res.json(logs);
  } catch (error) {
    console.error("Errore nel recupero dei log:", error);
    res.status(500).send("Errore del server");
  }
};

module.exports = {
  createLog,
  getLogs,
  getLogsByDate,
};
