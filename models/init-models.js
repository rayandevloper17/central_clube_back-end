// models/init-models.js
import { DataTypes } from 'sequelize';

// Import only the required model definitions
import _credit_transaction from './credit_transaction.js';
import _utilisateur from './utilisateur.js';
import _note_utilisateur from './note_utilisateur.js';
import _reservation_utilisateur from './reservation_utilisateur.js';
import _reservation from './reservation.js';
import _participant from './participant.js';
import _terrain from './terrain.js';
import _disponibilite_terrain from './disponibilite_terrain.js';
import _plage_horaire from './plage_horaire.js';
import _verification_email from './verification_email.js';

function initModels(sequelize) {
  const credit_transaction = _credit_transaction(sequelize, DataTypes);
  const utilisateur = _utilisateur(sequelize, DataTypes);
  const note_utilisateur = _note_utilisateur(sequelize, DataTypes);
  const reservation_utilisateur = _reservation_utilisateur(sequelize, DataTypes);
  const reservation = _reservation(sequelize, DataTypes);
  const participant = _participant(sequelize, DataTypes);
  const terrain = _terrain(sequelize, DataTypes);
  const disponibilite_terrain = _disponibilite_terrain(sequelize, DataTypes);
  const plage_horaire = _plage_horaire(sequelize, DataTypes);
  const verification_email = _verification_email(sequelize, DataTypes);

  return {
    credit_transaction,
    utilisateur,
    note_utilisateur,
    reservation_utilisateur,
    reservation,
    participant,
    terrain,
    disponibilite_terrain,
    plage_horaire,
    verification_email,
  };
}

export default initModels;