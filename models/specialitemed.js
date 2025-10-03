const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('specialitemed', {
    idspecmed: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    code: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    designation: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    CAC: {
      type: DataTypes.DECIMAL,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'specialitemed',
    schema: 'public',
    timestamps: false
  });
};
