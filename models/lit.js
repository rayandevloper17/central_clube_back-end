const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('lit', {
    idlit: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    codelit: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    etatlit: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    prixnuite: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    prixrepas: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    tva: {
      type: DataTypes.REAL,
      allowNull: true
    },
    codesale: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    remarque: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designation: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'lit',
    schema: 'public',
    timestamps: false
  });
};
