import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Reservation extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    id_utilisateur: {
      type: DataTypes.BIGINT,
      allowNull: false
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
    etat: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "En attente"
    },
    prix_total: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    date_creation: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    date_modif: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'reservation',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "idx_reservation_date",
        fields: [
          { name: "date" },
        ]
      },
      {
        name: "idx_reservation_utilisateur",
        fields: [
          { name: "id_utilisateur" },
        ]
      },
      {
        name: "reservation_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
