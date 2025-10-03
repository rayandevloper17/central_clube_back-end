const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('famille', {
    idfamille: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    codefamille: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    designationfamille: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    codedossier: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'famille',
    schema: 'public',
    timestamps: false
  });
};
