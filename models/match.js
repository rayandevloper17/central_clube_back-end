import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Match extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    id_reservation: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    id_createur: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    cle_prive: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    nombre_joueurs: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    etat: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "En attente"
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
    tableName: 'match',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "idx_match_reservation",
        fields: [
          { name: "id_reservation" },
        ]
      },
      {
        name: "match_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
