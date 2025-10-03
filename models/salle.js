const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('salle', {
    idsalle: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    codesale: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    codeserv: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    capacite: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    etatsal: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    remarque: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    nbrlit: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idsection: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    designation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    typesale: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'salle',
    schema: 'public',
    timestamps: false
  });
};
