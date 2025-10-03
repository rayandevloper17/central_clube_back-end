const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('journal', {
    designation: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    nature: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    code: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    cpc: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idjournal: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    iddossier: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codedossier: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    journalselect: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    opaacj: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'journal',
    schema: 'public',
    timestamps: false
  });
};
