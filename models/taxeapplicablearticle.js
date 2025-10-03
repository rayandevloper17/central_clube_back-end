const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('taxeapplicablearticle', {
    idtaxeapplicable: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    codearticle: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    codetaxe: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    codedossier: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    designationTaxe: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'taxeapplicablearticle',
    schema: 'public',
    timestamps: false
  });
};
