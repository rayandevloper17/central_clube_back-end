export default function createNoteUtilisateurService(models) {
    const { NoteUtilisateur } = models;

    return {
        // Create a new note
        async createNote(data) {
            const { id_match, id_noteur, id_notee, note } = data;

            if (!id_match || !id_noteur || !id_notee || !note) {
                throw new Error('All fields are required: id_match, id_noteur, id_notee, note');
            }
            const match = await models.Match.findByPk(id_match);
            if (!match) {
                throw new Error(`Match with ID ${id_match} does not exist`);
            }


            const newNote = await NoteUtilisateur.create({
                id_match,
                id_noteur,
                id_notee,
                note,
            });

            return newNote;
        },

        // Get all notes
        async getAllNotes() {
            return await NoteUtilisateur.findAll();
        },

        // Get a note by ID
        async getNoteById(id) {
            const note = await NoteUtilisateur.findByPk(id);
            if (!note) {
                throw new Error(`Note with ID ${id} not found`);
            }
            return note;
        },

        // Delete a note by ID
        async deleteNote(id) {
            const deletedCount = await NoteUtilisateur.destroy({ where: { id } });
            if (deletedCount === 0) {
                throw new Error(`Note with ID ${id} not found or already deleted`);
            }
            return { message: `Note with ID ${id} deleted successfully` };
        },
    };
}
