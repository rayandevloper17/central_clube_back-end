const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('configurationitem', {
    idconf: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nomitem: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    codeitem: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    iditem: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codeorganismeoufiliale: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    idorganismeoufiliale: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    ordre: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    bloc: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'configurationitem',
    schema: 'public',
    timestamps: false
  });
};
