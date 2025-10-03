const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('familleact', {
    idfamact: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    codfamact: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    typefamact: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codespecialite: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationspec: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'familleact',
    schema: 'public',
    timestamps: false
  });
};
