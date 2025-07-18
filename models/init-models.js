import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _CreditTransaction from  "./creditTransaction.js";
import _DisponibiliteTerrain from  "./disponibiliteTerrain.js";
import _Match from  "./match.js";
import _NoteUtilisateur from  "./noteUtilisateur.js";
import _Participant from  "./participant.js";
import _PlageHoraire from  "./plageHoraire.js";
import _Reservation from  "./reservation.js";
import _ReservationUtilisateur from  "./reservationUtilisateur.js";
import _Terrain from  "./terrain.js";
import _Utilisateur from  "./utilisateur.js";
import _VerificationEmail from  "./verificationEmail.js";

export default function initModels(sequelize) {
  const CreditTransaction = _CreditTransaction.init(sequelize, DataTypes);
  const DisponibiliteTerrain = _DisponibiliteTerrain.init(sequelize, DataTypes);
  const Match = _Match.init(sequelize, DataTypes);
  const NoteUtilisateur = _NoteUtilisateur.init(sequelize, DataTypes);
  const Participant = _Participant.init(sequelize, DataTypes);
  const PlageHoraire = _PlageHoraire.init(sequelize, DataTypes);
  const Reservation = _Reservation.init(sequelize, DataTypes);
  const ReservationUtilisateur = _ReservationUtilisateur.init(sequelize, DataTypes);
  const Terrain = _Terrain.init(sequelize, DataTypes);
  const Utilisateur = _Utilisateur.init(sequelize, DataTypes);
  const VerificationEmail = _VerificationEmail.init(sequelize, DataTypes);


  return {
    CreditTransaction,
    DisponibiliteTerrain,
    Match,
    NoteUtilisateur,
    Participant,
    PlageHoraire,
    Reservation,
    ReservationUtilisateur,
    Terrain,
    Utilisateur,
    VerificationEmail,
  };
}
