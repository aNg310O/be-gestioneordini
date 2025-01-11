const fs = require("fs");
const path = require("path");
const sequelize = require("../config/database");
const { Sequelize } = require("sequelize");

const models = {};

fs.readdirSync(__dirname)
  .filter((file) => file !== "index.js" && file.endsWith(".js"))
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    models[model.name] = model;
  });

// Associazioni tra i modelli
models.users.belongsTo(models.roles, { foreignKey: "role_id" });
models.ordini.belongsTo(models.prodotti, { foreignKey: "prodotto_id" });

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;
