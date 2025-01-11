module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "log",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      severity: DataTypes.STRING,
      username: DataTypes.STRING,
      page: DataTypes.STRING,
      text: DataTypes.STRING,
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "log",
      timestamps: false,
    }
  );
};
