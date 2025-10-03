const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('elementrapprochementancienop', {
    idetatrapp: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idecriture: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    noperation: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    dateop: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    designation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    natpiece: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    npiece: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    caux: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    mdebit: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    mcredit: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    cpc: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idexercice: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codedossier: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codejournal: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designatiounjournal: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idjournal: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    idetatrapprochementaicne: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'elementrapprochementancienop',
    schema: 'public',
    timestamps: false
  });
};
