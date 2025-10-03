const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('elementsbilan', {
    idele: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false
    },
    idbilan: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    rubrique: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    coderubrique: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    'brut n': {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    amortprov: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    netn: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    'netn-1': {
      type: DataTypes.DECIMAL,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'elementsbilan',
    schema: 'public',
    timestamps: false
  });
};
