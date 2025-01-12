module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "users",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // Aggiungi questa linea
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      valid: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      created_at: DataTypes.DATE,
    },
    {
      tableName: "users",
      timestamps: false,
    }
  );
};
