const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('fiscaliteparafisc', {
    designationrubric: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    nop: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cpc: {
      type: DataTypes.INTEGER,
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
    montantfinal: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    codefiscale: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    valeurbrut: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    idfiscparafisc: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idg50: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    valeurimposable: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    taux: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    nature: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    designationg50: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idecriture: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    declarernon: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    periode: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    dateop: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    designationecriture: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationperiode: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'fiscaliteparafisc',
    schema: 'public',
    timestamps: false
  });
};
