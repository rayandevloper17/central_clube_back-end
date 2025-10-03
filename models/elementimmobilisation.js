const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('elementimmobilisation', {
    idimmo: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false
    },
    designation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cpc: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idecriture: {
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
    idpertevaleur: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    iddotation: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    instance: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    traitee: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    compteur: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    montantht: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    montanttva: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    amortissementt: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    pertevaleurr: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    caux: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    dateachat: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    datedebutexpor: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    quantiteee: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    numerodeserie: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sectionaffectation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    systemeammortissement: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    numerofacture: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    valeurcomptable: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    totalammortissement: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    dotationexercice: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    tauxammortissement: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    valeurdepriciee: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    nouvellevaleur: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    numeroinventaire: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    comptabilizationetat: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    duredevie: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    pertevaleurex: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    valeurcomptaant: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    tauxutilisateur: {
      type: DataTypes.DECIMAL,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'elementimmobilisation',
    schema: 'public',
    timestamps: false
  });
};
