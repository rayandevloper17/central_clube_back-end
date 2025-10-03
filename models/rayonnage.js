const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('rayonnage', {
    idrayonage: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    coder: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    designation: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    niv: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    allee: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    casess: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codedos: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    codedepo: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'rayonnage',
    schema: 'public',
    timestamps: false
  });
};
