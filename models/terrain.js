import { Sequelize, DataTypes } from 'sequelize';

export default function(sequelize) {
  return sequelize.define('terrain', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'terrain',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "terrain_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};