module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "prodotti",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true },
      descrizione: DataTypes.STRING,
      grammatura: DataTypes.INTEGER,
      peso_totale: DataTypes.INTEGER,
      valid: DataTypes.BOOLEAN,
      created_at: DataTypes.DATE,
    },
    {
      tableName: "prodotti",
      timestamps: false,
    }
  );
};
