const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('convention', {
    idconv: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    code: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idexercice: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    iddossier: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codedossier: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    desconv: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    partorganisme: {
      type: DataTypes.REAL,
      allowNull: true
    },
    plafond: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    idtiers: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codetier: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationtiers: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    etatsssss: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    dateconventiondeb: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    dateconventionfin: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    partclient: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    avecfiliale: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codefiliale: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    typemodele: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'convention',
    schema: 'public',
    timestamps: false
  });
};
