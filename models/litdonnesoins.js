const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('litdonnesoins', {
    idlidonnesoins: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idsaledemandesoins: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idlit: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codelit: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    deslit: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dateentreeli: {
      type: DataTypes.DATE,
      allowNull: true
    },
    datesortieli: {
      type: DataTypes.DATE,
      allowNull: true
    },
    etatactuli: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'litdonnesoins',
    schema: 'public',
    timestamps: false
  });
};
