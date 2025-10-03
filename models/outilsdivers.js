const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('outilsdivers', {
    maxcomptecar: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idoutil: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'outilsdivers',
    schema: 'public',
    timestamps: false
  });
};
