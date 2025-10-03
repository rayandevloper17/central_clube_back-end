const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('fraisaccesoire', {
    idaccesoire: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    designation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    montant: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    ndocument: {
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
    typedoc: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'fraisaccesoire',
    schema: 'public',
    timestamps: false
  });
};
