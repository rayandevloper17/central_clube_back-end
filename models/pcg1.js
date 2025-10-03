const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('pcg1', {
    pospc: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    aux: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    eche: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    typecompte: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    iddossier: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    debit: {
      type: DataTypes.REAL,
      allowNull: true
    },
    credit: {
      type: DataTypes.REAL,
      allowNull: true
    },
    prevision: {
      type: DataTypes.REAL,
      allowNull: true
    },
    consomation: {
      type: DataTypes.REAL,
      allowNull: true
    },
    lettrable: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    lpc: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    cpc: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    nature: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codedossier: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'pcg1',
    schema: 'public',
    timestamps: false
  });
};
