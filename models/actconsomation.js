// models/actconsomation.js
import { DataTypes } from 'sequelize';

export default function (sequelize) {
  return sequelize.define('actconsomation', {
    idconsoact: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    codarticle: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationart: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    qiantite: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    codeact: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    coddossier: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idexercice: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    iddatehospit: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'actconsomation',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "actconsomation_pkey",
        unique: true,
        fields: [
          { name: "idconsoact" },
        ]
      },
    ]
  });
}