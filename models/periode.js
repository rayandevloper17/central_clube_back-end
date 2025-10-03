const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('periode', {
    idperiode: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    codedossier: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    nperiode: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idexercice: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    intitulemois: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    exercice: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    typeperiode: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    etatperiode: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cloture: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'periode',
    schema: 'public',
    timestamps: false
  });
};
