const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('destributionservice', {
    iddestribution: {
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
    desservice: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codearticle: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    desarticle: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    qtebase: {
      type: DataTypes.REAL,
      allowNull: true
    },
    codedossier: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idexercice: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idarticle: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    iddistritliste: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'destributionservice',
    schema: 'public',
    timestamps: false
  });
};
