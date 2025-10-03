export default function createNoteUtilisateurService(models) {
  const { note_utilisateur } = models;

  return {
    // Create a new note
    async createNote(data) {
      const { id_reservation, id_noteur, note } = data;

      if (!id_reservation || !id_noteur || !note) {
        throw new Error('All fields are required: id_reservation, id_noteur, note');
      }

      // Verify reservation exists
      const reservation = await models.reservation.findByPk(id_reservation);
      if (!reservation) {
        throw new Error(`Reservation with ID ${id_reservation} does not exist`);
      }

      const newNote = await note_utilisateur.create({
        id_reservation,
        id_noteur,
        note,
      });

      return newNote;
    },

    // Get all notes
    async getAllNotes() {
      return await note_utilisateur.findAll({
        include: [
          {
            model: models.reservation,
            as: 'reservation'
          },
          {
            model: models.utilisateur,
            as: 'noteur'
          }
        ]
      });
    },

    // Get notes by user ID
    async getNotesByUserId(userId) {
      const notes = await note_utilisateur.findAll({
        where: {
          id_noteur: userId
        },
        include: [
          {
            model: models.reservation,
            as: 'reservation'
          },
          {
            model: models.utilisateur,
            as: 'noteur'
          }
        ]
      });

      if (!notes.length) {
        throw new Error(`No notes found for user ID ${userId}`);
      }
      return notes;
    },

    // Get a note by ID
    async getNoteById(id) {
      const note = await note_utilisateur.findByPk(id, {
        include: [
          {
            model: models.reservation,
            as: 'reservation'
          }
        ]
      });

      if (!note) {
        throw new Error(`Note with ID ${id} not found`);
      }
      return note;
    },

    // Delete a note by ID
    async deleteNote(id) {
      const deletedCount = await note_utilisateur.destroy({ where: { id } });
      if (deletedCount === 0) {
        throw new Error(`Note with ID ${id} not found or already deleted`);
      }
      return { message: `Note with ID ${id} deleted successfully` };
    },
  };
}
