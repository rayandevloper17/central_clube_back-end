import { Sequelize, DataTypes } from 'sequelize';

export default function (sequelize) {
  const NoteUtilisateur = sequelize.define('note_utilisateur', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },

    id_noteur: {
      type: DataTypes.BIGINT,
      allowNull: false
      ,
        references: {
        model: 'utilisateur', // Name of the referenced table
        key: 'id' // Key in the referenced table
      }
    },

    date_creation: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    note: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    id_reservation: {
      type: DataTypes.BIGINT,
      allowNull: true // Made nullable for rating system
      // Temporarily removed foreign key constraint to support rating system
      // references: {
      //   model: 'reservation', // Name of the referenced table
      //   key: 'id' // Key in the referenced table
      // }
    }
  }, {
    sequelize,
    tableName: 'note_utilisateur',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "note_utilisateur_pkey",
        unique: true,
        fields: [
          { name: "id" }
        ]
      },
    ]
  });

  // Define the association
  NoteUtilisateur.associate = (models) => {
    NoteUtilisateur.belongsTo(models.reservation, {
      foreignKey: 'id_reservation',
      as: 'reservation'
    });
  };

  return NoteUtilisateur;
};