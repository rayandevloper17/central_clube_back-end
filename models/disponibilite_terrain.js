import { Sequelize, DataTypes } from 'sequelize';

export default function(sequelize) {
  return sequelize.define('disponibilite_terrain', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    id_terrain: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    id_plage_horaire: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    disponible: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    }
  }, {
    sequelize,
    tableName: 'disponibilite_terrain',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "disponibilite_terrain_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "idx_disponibilite_terrain_date",
        fields: [
          { name: "date" },
        ]
      },
    ]
  });
};