const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('patients', {
    idpatient: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    codepat: {
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
    datenaissance: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    lieunaissance: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    telephone: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    lieuresidence: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    etatpatient: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    derdatevisite: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    objectvisite: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codedossier: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idexercice: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    convention: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    positionpociale: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    NSS: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tauxcouverture: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    privillege: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    complementcouverture: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tarifs: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rizuss: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    genres: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'patients',
    schema: 'public',
    timestamps: false
  });
};
