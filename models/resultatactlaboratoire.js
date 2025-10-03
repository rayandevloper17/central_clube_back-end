const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('resultatactlaboratoire', {
    idresultatlabo: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    codeexam: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    limmin: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    limmax: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    resultat: {
      type: DataTypes.DECIMAL,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'resultatactlaboratoire',
    schema: 'public',
    timestamps: false
  });
};
