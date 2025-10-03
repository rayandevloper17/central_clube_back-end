const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('doccumentsnas_archive', {
    codedoc: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    typedoc: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    ndoc: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    caux: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    datedoc: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    montantdoc: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    coeficien: {
      type: DataTypes.REAL,
      allowNull: true
    },
    ecart: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    codedossier: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    entree: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    sortie: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    designationcaux: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    clefreffact: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    typeclefref: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idexercice: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    stock: {
      type: DataTypes.REAL,
      allowNull: true
    },
    codmag: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    desmagasin: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dtypedocbase: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    datedocbase: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    ndocbase: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idds: {
      type: DataTypes.INTEGER,
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
    ttc: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    iddsfact: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    typeprat: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Totalht: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    timbre: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    praticienmntnt: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    Netapayer: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    soinscomp: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    extrat: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    timbreclinique: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    timbremed: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    datecommande: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    numcommande: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codecapex: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationcapex: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    nbl: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    datebl: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    etat: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    nproforma: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dateproforma: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    ndemandeprix: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    datedemandeprix: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    iddoc: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'doccumentsnas_archive',
    schema: 'public',
    timestamps: false
  });
};
