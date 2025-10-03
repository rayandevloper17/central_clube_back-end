const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('operationjournal', {
    idoperationjournal: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idoperation: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idjournal: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    numop: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    codejournak: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    CSECTION: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'operationjournal',
    schema: 'public',
    timestamps: false
  });
};
