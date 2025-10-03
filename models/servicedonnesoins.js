const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('servicedonnesoins', {
    idservicedonnesoin: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idds: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codeservice: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idservice: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    designationservice: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dateentreesr: {
      type: DataTypes.DATE,
      allowNull: true
    },
    datesortisr: {
      type: DataTypes.DATE,
      allowNull: true
    },
    etatactusr: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'servicedonnesoins',
    schema: 'public',
    timestamps: false
  });
};
