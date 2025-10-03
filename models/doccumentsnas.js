const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('doccumentsnas', {
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
    cptepartO: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    idconv: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codepartP: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    valeurremise: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    typeremise: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    iddoc: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false
    },
    recoursouvalider: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    paye: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pardci: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tarfiengagcab: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    tarifengagceh: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    tarifceht: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    remise: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    remiseval: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    htconsom: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    htsoincom: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    extra: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    toaaaalhttt: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    totalremise: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    etatfacture: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idcaisse: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    conv: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idrecape: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    etatf: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    valop: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    periode: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'doccumentsnas',
    schema: 'public',
    timestamps: false
  });
};
