const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('distritliste', {
    iddistritliste: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idservice: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codeservice: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationservice: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codossier: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idexercice: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    typeartcle: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'distritliste',
    schema: 'public',
    timestamps: false
  });
};
