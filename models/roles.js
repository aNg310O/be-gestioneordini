module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "roles",
    {
      role_id: { type: DataTypes.INTEGER, primaryKey: true },
      role: DataTypes.STRING,
      created_at: DataTypes.DATE,
    },
    {
      tableName: "roles",
      timestamps: false, // Evita di creare automaticamente campi `createdAt` e `updatedAt`
    }
  );
};
