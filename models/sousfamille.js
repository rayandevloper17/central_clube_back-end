const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('sousfamille', {
    idsoufamilles: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    codesoufamilles: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    codedossier: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    designationsousfamille: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    codefamille: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    designationfamille: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'sousfamille',
    schema: 'public',
    timestamps: false
  });
};
