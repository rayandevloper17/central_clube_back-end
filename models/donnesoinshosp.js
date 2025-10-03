const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('donnesoinshosp', {
    idpatient: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codepatient: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    nom: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    prenom: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dateheure: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    typesoinsss: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codeservice: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationservice: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    etage: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codesale: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    litsss: {
      type: DataTypes.TEXT,
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
    typepayeur: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idpayeur: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    designationpayeur: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codepayeur: {
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
    idmedtraitant: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codemedtraitant: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationmedtraitant: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    objectsoin: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    etatdemandesoin: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    iddateids: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    origine: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    iddonsoin: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'donnesoinshosp',
    schema: 'public',
    timestamps: false
  });
};
