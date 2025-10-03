const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('caisseencs', {
    code: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    typecaisse: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idcaissereverssemebt: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codecaissereversement: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationcaissereversement: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    coddossier: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    etacaisse: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codemag: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    desimag: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idccaisse: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'caisseencs',
    schema: 'public',
    timestamps: false
  });
};
