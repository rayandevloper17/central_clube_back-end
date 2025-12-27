export default function createNoteUtilisateurService(models) {
  const { note_utilisateur } = models;

  return {
    // Create a new note
    async createNote(data) {
      const { id_reservation, id_noteur, note } = data;

      if (!id_reservation || !id_noteur || !note) {
        throw new Error('All fields are required: id_reservation, id_noteur, note');
      }

      // For rating system: use a dummy reservation ID if the provided one doesn't exist
      let effectiveReservationId = id_reservation;
      
      try {
        const reservation = await models.reservation.findByPk(id_reservation);
        if (!reservation) {
          console.log(`Warning: Reservation ${id_reservation} not found, using dummy reservation ID 999999 for rating system`);
          effectiveReservationId = 999999; // Use a dummy reservation ID
        }
      } catch (error) {
        console.log(`Error checking reservation: ${error.message}, using dummy reservation ID 999999`);
        effectiveReservationId = 999999;
      }

      const newNote = await note_utilisateur.create({
        id_reservation: effectiveReservationId,
        id_noteur,
        note,
      });

      return newNote;
    },

    // Get all notes (redefined): return users with their rating and display flag
    async getAllNotes() {
      return await models.utilisateur.findAll({
        attributes: ['id', 'nom', 'prenom', 'note', 'image_url', 'displayQ']
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

      // Return empty array if no notes found instead of throwing error
      return notes || [];
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
