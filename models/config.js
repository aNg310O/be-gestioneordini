module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "config",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false },
      value: { type: DataTypes.STRING, allowNull: false },
    },
    {
      tableName: "config",
      timestamps: false,
    }
  );
};
