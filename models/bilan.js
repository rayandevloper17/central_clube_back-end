const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('bilan', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    idexercice: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codedoss: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    typebilan: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    designationtype: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'bilan',
    schema: 'public',
    timestamps: false
  });
};
