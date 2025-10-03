const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('operation', {
    codejournal: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    datesk: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    LOPER: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    JECHE: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    idoperation: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idexercice: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    iddossier: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    numoperation: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    codedossier: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    NPIECE: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    CSECTION: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    NumPIECE: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ordre: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    periode: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'operation',
    schema: 'public',
    timestamps: false
  });
};
