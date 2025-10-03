const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('salledonnesoin', {
    idsaledemandesoins: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idservicedonnesoin: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idsalle: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codesalle: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationsalle: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dateentreesl: {
      type: DataTypes.DATE,
      allowNull: true
    },
    datesortisl: {
      type: DataTypes.DATE,
      allowNull: true
    },
    etatactusl: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'salledonnesoin',
    schema: 'public',
    timestamps: false
  });
};
