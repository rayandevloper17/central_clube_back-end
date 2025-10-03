const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('demandeexploration', {
    iddemandeexploration: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idds: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codfamact: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationfamact: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idexercice: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    coddossier: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    typefamact: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    etatexprl: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    compterendue: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    datedemande: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    idpatient: {
      type: DataTypes.INTEGER,
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
    iddatehospit: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    motifs: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    originedemande: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idcaisse: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    payer: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'demandeexploration',
    schema: 'public',
    timestamps: false
  });
};
