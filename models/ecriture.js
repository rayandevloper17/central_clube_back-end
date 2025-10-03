const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ecriture', {
    idoperation: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    LIGNOP: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cpc: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    CAUX: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    mdebit: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    mcredi: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    ECRLET: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ETATIMMO: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    designationligne: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    lettrage: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    raprocher: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fiscparafisc: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    declarerno: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idecriture: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'ecriture',
    schema: 'public',
    timestamps: false
  });
};
