import { DataTypes } from 'sequelize';

// In your plage_horaire model file (add this after the model definition)
export default function(sequelize) {
  const PlageHoraire = sequelize.define('plage_horaire', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    price: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    disponible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    terrain_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'terrain',
        key: 'id'
      }
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'plage_horaire',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "plage_horaire_pkey",
        unique: true,
        fields: [{ name: "id" }]
      }
    ]
  });

  // Add this association method
  PlageHoraire.associate = function(models) {
    // A PlageHoraire belongs to a Terrain
    PlageHoraire.belongsTo(models.terrain, {
      foreignKey: 'terrain_id',
      as: 'terrain'
    });
  };

  return PlageHoraire;
}
// In your terrain model file (add this association method)
function createTerrainModel(sequelize) {
  const Terrain = sequelize.define('terrain', {
    // ... your terrain model definition
  }, {
    // ... your terrain model options
  });

  // Add this association method
  Terrain.associate = function(models) {
    // A Terrain has many PlageHoraires
    Terrain.hasMany(models.plage_horaire, {
      foreignKey: 'terrain_id',
      as: 'plageHoraires'
    });
  };

  return Terrain;
}