const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('pcg', {
    POSPC: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    AUX: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ECHE: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    typecompte: {
      type: DataTypes.INTEGER,
      allowNull: true
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
      allowNull: true
    },
    cpc: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    nature: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idpcg: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: true
    },
    amortissable: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codedossier: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rez: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    report: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'pcg',
    schema: 'public',
    timestamps: false
  });
};
