const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('inventaireliste_archive', {
    idinventliste: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idexercice: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codedossier: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    typelocinventaire: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Codemagserv: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    desmagserv: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    periodeinvent: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    parcialterminer: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    finalnon: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    nominventaire: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    bonE: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    bonS: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    totalqtecompta: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    totalqtephysique: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    totalecart: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    debutinventaire: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'inventaireliste_archive',
    schema: 'public',
    timestamps: false
  });
};
