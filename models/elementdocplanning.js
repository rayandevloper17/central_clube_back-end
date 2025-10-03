const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('elementdocplanning', {
    codedoc: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationarticle: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    quantiteentree: {
      type: DataTypes.REAL,
      allowNull: true
    },
    quantitesortie: {
      type: DataTypes.REAL,
      allowNull: true
    },
    prixhtunitaire: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    coutunite: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    valeur: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    iddoc: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    codedossier: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codarticle: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    localisationsnas: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idexercice: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    quantitesortierez: {
      type: DataTypes.REAL,
      allowNull: true
    },
    quantitentreerez: {
      type: DataTypes.REAL,
      allowNull: true
    },
    idds: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cdmg: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    quantiteentrearrivage: {
      type: DataTypes.REAL,
      allowNull: true
    },
    quantitesortiearrivage: {
      type: DataTypes.REAL,
      allowNull: true
    },
    iddatehospit: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tva: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    montantttcs: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    rubriquefact: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    typeblockss: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    nlot: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dateperemp: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    qtefacture: {
      type: DataTypes.REAL,
      allowNull: true
    },
    codepraticien: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tvapourc: {
      type: DataTypes.REAL,
      allowNull: true
    },
    qteinit: {
      type: DataTypes.REAL,
      allowNull: true
    },
    montantinit: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    montantinittotal: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    typedoc: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    remise: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    dateplann: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    heureplann: {
      type: DataTypes.TIME,
      allowNull: true
    },
    codeservice: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    etat: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codepatient: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idelementdocplann: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'elementdocplanning',
    schema: 'public',
    timestamps: false
  });
};
