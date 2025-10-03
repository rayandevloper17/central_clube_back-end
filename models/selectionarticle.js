const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('selectionarticle', {
    idselect: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    codeselect: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codedossier: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'selectionarticle',
    schema: 'public',
    timestamps: false
  });
};
