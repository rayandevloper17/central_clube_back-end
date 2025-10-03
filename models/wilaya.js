const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('wilaya', {
    designation: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    idwilaya: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'wilaya',
    schema: 'public',
    timestamps: false
  });
};
