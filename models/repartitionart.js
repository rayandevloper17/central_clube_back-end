const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('repartitionart', {
    idrepartitionart: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    coderep: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationrep: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codeart: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    coddossier: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'repartitionart',
    schema: 'public',
    timestamps: false
  });
};
