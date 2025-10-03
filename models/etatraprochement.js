const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('etatraprochement', {
    datedeb: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    datefin: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    codedossier: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idexercice: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    nperiode: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cpc: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dateetatrapp: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    designationetatrap: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    debitinit: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    creditinit: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    debitfin: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    creditfin: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    etatdeletatderapp: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idetatrapp: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'etatraprochement',
    schema: 'public',
    timestamps: false
  });
};
