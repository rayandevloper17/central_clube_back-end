const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('structurefiscaletsocial', {
    designation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    typestruct: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cpc: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idstruct: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idstructfiscsoc: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'structurefiscaletsocial',
    schema: 'public',
    timestamps: false
  });
};
