import { Sequelize, DataTypes } from 'sequelize';

export default function(sequelize) {
  return sequelize.define('credit_transaction', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    id_utilisateur: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    nombre: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    date_creation: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    type: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'credit_transaction',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "credit_transaction_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};