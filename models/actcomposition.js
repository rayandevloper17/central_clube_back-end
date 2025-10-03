import { Sequelize } from 'sequelize';
export default function(sequelize, DataTypes) {
  return sequelize.define('actcomposition', {
    idactcomposition: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    codeact: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    designationact: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idactcompo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    codeactpere: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    coddossier: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    iddatehospit: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'actcomposition',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "actcomposition_pkey",
        unique: true,
        fields: [
          { name: "idactcomposition" },
        ]
      },
    ]
  });
};
