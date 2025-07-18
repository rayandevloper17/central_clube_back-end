import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class ReservationUtilisateur extends Model {
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
    id_reservation: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'reservation_utilisateur',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "reservation_utilisateur_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
