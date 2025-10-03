const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('pco', {
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
    amortissable: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idpco: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    report: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rez: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'pco',
    schema: 'public',
    timestamps: false
  });
};
