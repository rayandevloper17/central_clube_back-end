const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('elementinventaire', {
    idinventliste: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reference: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    designation: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    qtecomptable: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    qtephysique: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ecart: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    justificatif: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    codedossier: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idexercice: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idelementinvent: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'elementinventaire',
    schema: 'public',
    timestamps: false
  });
};
