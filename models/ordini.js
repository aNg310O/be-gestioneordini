module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "ordini",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true },
      seller: DataTypes.STRING,
      data_inserimento: DataTypes.DATE,
      prodotto_id: DataTypes.INTEGER,
      qty: DataTypes.INTEGER,
      peso_totale: DataTypes.INTEGER,
      notes: DataTypes.STRING,
      is_custom: DataTypes.BOOLEAN,
      created_at: DataTypes.DATE,
    },
    {
      tableName: "ordini",
      timestamps: false,
    }
  );
};
