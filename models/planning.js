const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('planning', {
    idplanninggg: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false
    },
    designationplanning: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    codedossierrr: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idexercice: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    etatplanning: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'planning',
    schema: 'public',
    timestamps: false
  });
};
