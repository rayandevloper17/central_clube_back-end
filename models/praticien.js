const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('praticien', {
    idpraticien: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    code: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    nom: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    prenom: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codespesialite: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    diplome: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    statue: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    nagrement: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dateagrement: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    dateentree: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    datesortie: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    disponibilite: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    incident: {
      type: DataTypes.TEXT,
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
    desspeciqlite: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fonctionprat: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    salairenet: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    charge: {
      type: DataTypes.DECIMAL,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'praticien',
    schema: 'public',
    timestamps: false
  });
};
