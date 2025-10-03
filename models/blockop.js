const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('blockop', {
    idblock: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    codesalle: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationsalle: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codeistrumentiste: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    desinstrumentiste: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codeanesthesiste: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    desanesthesiste: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    coderea: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    desrea: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codeaide: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    desaide: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codesagefemme: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dessagefemme: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codepediatre: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    despediatre: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    positionssss: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idds: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    etatpatient: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    hentree: {
      type: DataTypes.TIME,
      allowNull: true
    },
    heuressortie: {
      type: DataTypes.TIME,
      allowNull: true
    },
    htransfert: {
      type: DataTypes.TIME,
      allowNull: true
    },
    heurefin: {
      type: DataTypes.TIME,
      allowNull: true
    },
    heuredebut: {
      type: DataTypes.TIME,
      allowNull: true
    },
    codepanseur: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    despanseur: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codeaide2: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    desaide2: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    iddatehospit: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'blockop',
    schema: 'public',
    timestamps: false
  });
};
