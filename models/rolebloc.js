const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('rolebloc', {
    idroleblock: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    codepraticien: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    nom: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rolessss: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    prenom: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'rolebloc',
    schema: 'public',
    timestamps: false
  });
};
