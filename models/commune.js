const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('commune', {
    designation: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    idwilaya: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idcomune: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'commune',
    schema: 'public',
    timestamps: false
  });
};
