const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('explorationimagerie', {
    idexplorationimagerie: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    iddemandeexploration: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codeact: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationact: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dateacte: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    idact: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    prixss: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    rezultat: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    iddatehospit: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    datedemande: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    etatexprl: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codeprat: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idprat: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    designat: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    hospits: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    typefamact: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rubriquefact: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codespe: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationspec: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'explorationimagerie',
    schema: 'public',
    timestamps: false
  });
};
