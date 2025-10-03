const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('articlesa', {
    codeart: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    designation: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    codesousfami: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    coderayon: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    prixachat: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    taxes: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    stocksecurite: {
      type: DataTypes.REAL,
      allowNull: true
    },
    typemarge: {
      type: DataTypes.REAL,
      allowNull: true
    },
    MargePrivile: {
      type: DataTypes.REAL,
      allowNull: true
    },
    Margesecurite: {
      type: DataTypes.REAL,
      allowNull: true
    },
    Margedistributeur: {
      type: DataTypes.REAL,
      allowNull: true
    },
    Margegros: {
      type: DataTypes.REAL,
      allowNull: true
    },
    Margedetail: {
      type: DataTypes.REAL,
      allowNull: true
    },
    Margepublique: {
      type: DataTypes.REAL,
      allowNull: true
    },
    coddossier: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idsousfamille: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    dernierprix: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    codefam: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationfam: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codsousfam: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationsousfam: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationrayon: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codemag: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationmag: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    pprixventess: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    uachat: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    quantitessssss: {
      type: DataTypes.REAL,
      allowNull: true
    },
    unitefacturess: {
      type: DataTypes.REAL,
      allowNull: true
    },
    tva: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    coderepart: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationrepart: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rubriquefact: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tvavente: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    codebare: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    naturearticle: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    preomption: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cpc: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    obser: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    prixvG: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    prixvDist: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    prixvdetaill: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    prixvReven: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    prixvPartic: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    prixvImport: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    idarticle: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false
    },
    DCI: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Marque: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    etat: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Nordre: {
      type: DataTypes.DECIMAL,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'articlesa',
    schema: 'public',
    timestamps: false
  });
};
