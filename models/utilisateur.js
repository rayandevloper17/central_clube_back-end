import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Utilisateur extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    nom: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    prenom: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    date_naissance: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    numero_telephone: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    mot_de_passe: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    credit: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0
    },
    points: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0
    },
    note: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date_creation: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    date_misajour: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'utilisateur',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "idx_utilisateur_email",
        fields: [
          { name: "email" },
        ]
      },
      {
        name: "utilisateur_email_key",
        unique: true,
        fields: [
          { name: "email" },
        ]
      },
      {
        name: "utilisateur_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
