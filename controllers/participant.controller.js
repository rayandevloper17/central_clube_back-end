// controllers/participant.controller.js
export default function ParticipantController(models) {
  const Participant = models.participant;


  const create = async (req, res) => {
    const t = await models.sequelize.transaction();
    try {
      const { id_reservation, id_utilisateur, est_createur, statepaiement, typepaiement } = req.body;
      // Support either 'teamIndex' from clients or 'team'
      const teamCandidate = (req.body.teamIndex !== undefined) ? req.body.teamIndex : req.body.team;

      if (!id_reservation) {
        await t.rollback();
        return res.status(400).json({ error: "Reservation ID is required" });
      }
      if (!id_utilisateur) {
        await t.rollback();
        return res.status(400).json({ error: "User ID is required" });
      }
      // Ensure team index is provided and valid (0..3)
      if (teamCandidate === undefined || teamCandidate === null) {
        await t.rollback();
        return res.status(400).json({ error: "Team index is required (0,1,2,3)" });
      }
      const teamIndex = Number(teamCandidate);
      if (!Number.isInteger(teamIndex) || teamIndex < 0 || teamIndex > 3) {
        await t.rollback();
        return res.status(400).json({ error: "Invalid team index. Must be 0,1,2, or 3" });
      }
      // ✅ Check if user already joined this reservation
      const existingParticipant = await Participant.findOne({
        where: { id_reservation, id_utilisateur },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (existingParticipant) {
        await t.rollback();
        return res.status(400).json({
          error: "Vous avez déjà rejoint ce match",
          code: "ALREADY_JOINED"
        });
      }
      // ✅ Check if team slot already taken
      const existingSlot = await Participant.findOne({ where: { id_reservation, team: teamIndex }, transaction: t, lock: t.LOCK.UPDATE });
      if (existingSlot) {
        await t.rollback();
        return res.status(400).json({
          error: `Désolé, cette position (${teamIndex + 1}) a été prise par un autre utilisateur. Veuillez choisir une autre position.`,
          code: "SLOT_TAKEN",
          takenSlot: teamIndex
        });
      }
      // ✅ Count participants for this reservation
      const currentParticipantsCount = await Participant.count({
        where: { id_reservation },
        transaction: t,
      });
      if (currentParticipantsCount >= 4) {
        await t.rollback();
        return res.status(400).json({
          error: "Désolé, ce match est complet. Maximum de 4 joueurs atteint.",
          code: "MATCH_FULL",
          currentPlayers: currentParticipantsCount,
          maxPlayers: 4
        });
      }
      // ✅ Rating range validation for open matches (typer === 2)
      // Fetch reservation and user note to validate if the joiner meets the required range
      const reservation = await models.reservation.findByPk(id_reservation, { transaction: t, lock: t.LOCK.UPDATE });
      if (!reservation) {
        await t.rollback();
        return res.status(404).json({ error: "Reservation not found" });
      }
      // Only enforce for open matches
      const typerVal = Number(reservation?.typer ?? 0);
      if (typerVal === 2) {
        const minFloat = Number(reservation?.min);
        const maxFloat = Number(reservation?.max);
        if (Number.isFinite(minFloat) && Number.isFinite(maxFloat)) {
          // Fetch the user's rating
          const user = await models.utilisateur.findByPk(id_utilisateur, { transaction: t, lock: t.LOCK.UPDATE });
          if (!user) {
            await t.rollback();
            return res.status(404).json({ error: "Utilisateur not found" });
          }
          const userNote = Number(user?.note ?? 0);

          if (userNote < minFloat || userNote > maxFloat) {
            console.log(`[ParticipantController] LEVEL VALIDATION FAILED: userNote=${userNote}, requiredRange=[${minFloat}..${maxFloat}]`);
            // Non-blocking informational response: no charge, no participant created
            await t.rollback();
            return res.status(200).json({
              success: false,
              info: true,
              canJoin: false,
              message: `Votre niveau ${userNote.toFixed(1)} est en dehors de la plage requise [${minFloat.toFixed(1)} .. ${maxFloat.toFixed(1)}] pour ce match.`,
              code: "LEVEL_OUT_OF_RANGE",
              currentPlayers: currentParticipantsCount,
              maxPlayers: 4,
              spotsRemaining: Math.max(0, 4 - currentParticipantsCount)
            });
          }
          console.log(`[ParticipantController] LEVEL VALIDATION PASSED: userNote=${userNote}, requiredRange=[${minFloat}..${maxFloat}]`);
        }
      }

      // ════════════════════════════════════════════════════════════════════════
      // FIXED: Properly handle statepaiement and typepaiement values
      // ════════════════════════════════════════════════════════════════════════
      // The bug was using `statepaiement || 1` which converts 0 to 1
      // because 0 is falsy in JavaScript!
      // 
      // Correct values:
      // - typepaiement: 1 = Crédit, 2 = Sur place
      // - statepaiement: 0 = not paid, 1 = paid
      // ════════════════════════════════════════════════════════════════════════

      // Use nullish coalescing (??) instead of logical OR (||)
      // This only defaults to 1 if the value is null or undefined, NOT if it's 0
      // Joining an open match: default to payment pending validation (0) and credit method (1)
      const finalStatePaiement = (statepaiement !== undefined && statepaiement !== null)
        ? Number(statepaiement)
        : 0;
      const finalTypePaiement = (typepaiement !== undefined && typepaiement !== null)
        ? Number(typepaiement)
        : 1;

      console.log(`[ParticipantController] Creating participant for reservation ${id_reservation}: user=${id_utilisateur}, team=${teamIndex}, est_createur=${est_createur}`);
      console.log(`[ParticipantController] Payment details: statepaiement=${finalStatePaiement}, typepaiement=${finalTypePaiement} (raw: statepaiement=${statepaiement}, typepaiement=${typepaiement})`);

      // ════════════════════════════════════════════════════════════════════════════
      // 🔐 PAYMENT PROCESSING - WITH DOUBLE-CHARGE PREVENTION
      // ════════════════════════════════════════════════════════════════════════════
      // 
      // SKIP payment if:
      // 1. User is the creator (est_createur = true) - they paid during reservation creation
      // 2. User already has a payment transaction for this reservation (prevents double-charge)
      // 3. Payment type is "sur place" (on-site) - typepaiement = 2
      //
      // ════════════════════════════════════════════════════════════════════════════

      // ════════════════════════════════════════════════════════════════════════════
      // FIX FOR participant.controller.js
      // Location: Line 140-190 (Payment processing section)
      // 
      // BUG: Double charging when creator creates match with credit payment
      // The creator is charged in reservationService.create()
      // Then charged AGAIN when participant record is created here
      // ════════════════════════════════════════════════════════════════════════════

      // ✅ REPLACE THE PAYMENT PROCESSING SECTION WITH THIS:

      if (est_createur) {
        // ═══════════════════════════════════════════════════════════════════════
        // ✅ CREATOR: Already paid during reservation creation
        // ═══════════════════════════════════════════════════════════════════════
        console.log(`[ParticipantController] Skipping payment for creator ${id_utilisateur} - already paid during reservation creation`);

      } else {
        // ═══════════════════════════════════════════════════════════════════════
        // 💰 NON-CREATOR: Process payment for joining user
        // ═══════════════════════════════════════════════════════════════════════

        console.log(`[ParticipantController] Checking payment for user ${id_utilisateur} joining reservation ${id_reservation}`);

        // ───────────────────────────────────────────────────────────────────────
        // STEP 1: Check if user already has an ACTIVE payment for this reservation
        // ───────────────────────────────────────────────────────────────────────

        // Find ALL transactions (debits AND refunds) for this user + reservation
        const transactions = await models.credit_transaction.findAll({
          where: {
            id_utilisateur: id_utilisateur,
            type: {
              [models.Sequelize.Op.or]: [
                // Debit patterns (negative amounts)
                { [models.Sequelize.Op.like]: `debit:join:R${id_reservation}:U${id_utilisateur}%` },
                { [models.Sequelize.Op.like]: `debit:reservation:R${id_reservation}:U${id_utilisateur}%` },

                // Refund patterns (positive amounts)
                { [models.Sequelize.Op.like]: `refund:cancel:R${id_reservation}%` },
                { [models.Sequelize.Op.like]: `refund:override:R${id_reservation}%` },
                { [models.Sequelize.Op.like]: `refund:match_override:R${id_reservation}%` },
                { [models.Sequelize.Op.like]: `refund:autocancel:R${id_reservation}:U${id_utilisateur}%` }
              ]
            }
          },
          transaction: t
        });

        // Calculate NET balance: sum of all debits (negative) and refunds (positive)
        const netPaid = transactions.reduce((sum, tx) => sum + Number(tx.nombre), 0);

        console.log(`[ParticipantController] Payment status for user ${id_utilisateur}:`, {
          transactionCount: transactions.length,
          netPaid: netPaid,
          isCurrentlyPaid: netPaid < -0.01
        });

        // ───────────────────────────────────────────────────────────────────────
        // STEP 2: Determine if payment is needed
        // ───────────────────────────────────────────────────────────────────────

        const isCurrentlyPaid = netPaid < -0.01; // User has net negative balance = already paid

        if (isCurrentlyPaid) {
          // ✅ SKIP: User already paid and has NOT been fully refunded
          console.log(`[ParticipantController] ✅ User ${id_utilisateur} already paid (net: ${netPaid})`);

        } else if (finalTypePaiement === 2) {
          // ✅ SKIP: On-site payment selected
          console.log(`[ParticipantController] ✅ On-site payment selected (typepaiement=2)`);

        } else {
          // ───────────────────────────────────────────────────────────────────────
          // 💳 CHARGE: User needs to pay with credit
          // ───────────────────────────────────────────────────────────────────────

          console.log(`[ParticipantController] 💳 Processing credit payment for user ${id_utilisateur}`);

          // Get slot price
          const plage = reservation.id_plage_horaire
            ? await models.plage_horaire.findByPk(reservation.id_plage_horaire, {
              transaction: t,
              lock: t.LOCK.UPDATE
            })
            : null;

          const slotPrice = (() => {
            const p = Number(plage?.price ?? reservation?.prix_total ?? 0);
            return Number.isFinite(p) && p > 0 ? p : 0;
          })();

          console.log(`[ParticipantController] Slot price: ${slotPrice}`);

          if (slotPrice > 0) {
            // Lock user for balance operations
            const joiner = await models.utilisateur.findByPk(id_utilisateur, {
              transaction: t,
              lock: t.LOCK.UPDATE
            });

            if (!joiner) {
              await t.rollback();
              return res.status(404).json({ error: "Utilisateur not found" });
            }

            const currentBalance = Number(joiner.credit_balance ?? 0);

            console.log(`[ParticipantController] Balance check:`, {
              currentBalance,
              slotPrice,
              sufficient: currentBalance >= slotPrice
            });

            // Check sufficient balance
            if (!Number.isFinite(currentBalance) || currentBalance < slotPrice) {
              await t.rollback();
              return res.status(400).json({
                error: "Solde de crédit insuffisant",
                code: "INSUFFICIENT_BALANCE",
                currentBalance: currentBalance,
                required: slotPrice
              });
            }

            // Deduct balance
            const newBalance = currentBalance - slotPrice;
            await joiner.update({ credit_balance: newBalance }, { transaction: t });

            // Generate unique transaction ID to allow re-joining
            const uniqueTxId = Date.now().toString();

            // Record payment transaction
            await models.credit_transaction.create({
              id_utilisateur: id_utilisateur,
              nombre: -slotPrice,
              type: `debit:join:R${id_reservation}:U${id_utilisateur}:T${teamIndex}:${uniqueTxId}`,
              date_creation: new Date()
            }, { transaction: t });

            console.log(`[ParticipantController] ✅ Charged ${slotPrice} credits:`, {
              oldBalance: currentBalance,
              newBalance: newBalance,
              transactionId: `debit:join:R${id_reservation}:U${id_utilisateur}:T${teamIndex}:${uniqueTxId}`
            });
          }
        }
      }

      // ════════════════════════════════════════════════════════════════════════════
      // SUMMARY OF CHANGES:
      // 
      // 1. ✅ Always skip payment for creators (est_createur = true)
      // 2. ✅ For non-creators, calculate NET balance of all transactions
      // 3. ✅ Only charge if: net balance >= 0 AND typepaiement == 1 (credit)
      // 4. ✅ This prevents double-charging when:
      //    - User creates match ouvert (charged in reservationService)
      //    - User cancels match ouvert (refunded)
      //    - User creates private match (would be charged again - NOW PREVENTED!)
      // 
      // ════════════════════════════════════════════════════════════════════════════

      const participantData = {
        id_reservation,
        id_utilisateur,
        est_createur: est_createur || false,
        statepaiement: finalStatePaiement,
        typepaiement: finalTypePaiement,
        team: teamIndex
      };

      console.log(`[ParticipantController] Creating participant with data:`, participantData);

      const result = await Participant.create(participantData, { transaction: t });

      const updatedCount = await Participant.count({ where: { id_reservation }, transaction: t });

      console.log(`[ParticipantController] Participant created successfully. Current count: ${updatedCount}`);

      // If open match reaches 4 participants, mark as valid and cancel competitors
      if (typerVal === 2 && updatedCount === 4) {
        console.log(`[ParticipantController] Open match reached 4 players - marking as valid`);

        // Mark reservation as valid
        await reservation.update({
          etat: 1,
          date_modif: new Date()
        }, { transaction: t });

        // Import the service to access handleValidMatchCreated
        // const ReservationService = require('../services/reservation.service');

        // Cancel all other open matches for same slot+date
        console.log(`[ParticipantController] Calling handleValidMatchCreated for open match ${id_reservation}`);

        // We need to directly call the utility function
        // Since it's not exported, we'll implement the logic inline

        // Get all OTHER open matches for same slot+date
        const competingOpenMatches = await models.reservation.findAll({
          where: {
            id_plage_horaire: reservation.id_plage_horaire,
            date: reservation.date,
            typer: 2, // Only open matches
            isCancel: 0,
            etat: { [models.Sequelize.Op.ne]: 1 }, // 🔥 CRITICAL: Only PENDING matches
            id: { [models.Sequelize.Op.ne]: id_reservation } // Exclude current reservation
          },
          transaction: t,
          lock: t.LOCK.UPDATE
        });

        console.log(`[ParticipantController] Found ${competingOpenMatches.length} competing open match(es) to cancel`);

        // Cancel each competing match and refund participants
        for (const competingMatch of competingOpenMatches) {
          console.log(`[ParticipantController] Cancelling competing match ${competingMatch.id}`);

          // Cancel the reservation
          await competingMatch.update({
            isCancel: 1,
            etat: -1,
            date_modif: new Date()
          }, { transaction: t });

          // Find all participants
          const competingParticipants = await models.participant.findAll({
            where: { id_reservation: competingMatch.id },
            transaction: t,
            lock: t.LOCK.UPDATE
          });

          // Build list of users to refund
          const usersToRefund = new Set();
          usersToRefund.add(competingMatch.id_utilisateur); // Creator
          competingParticipants.forEach(p => usersToRefund.add(p.id_utilisateur));

          // Refund each user
          const refundAmount = Number(competingMatch.prix_total ?? 0);

          for (const userId of usersToRefund) {
            // Check if user paid
            const userDebit = await models.credit_transaction.findOne({
              where: {
                id_utilisateur: userId,
                [models.Sequelize.Op.or]: [
                  { type: `debit:reservation:R${competingMatch.id}:U${userId}:creator` },
                  { type: { [models.Sequelize.Op.like]: `debit:join:R${competingMatch.id}:U${userId}%` } }
                ],
                nombre: { [models.Sequelize.Op.lt]: 0 }
              },
              transaction: t
            });

            if (userDebit) {
              const user = await models.utilisateur.findByPk(userId, {
                transaction: t,
                lock: t.LOCK.UPDATE
              });

              if (user) {
                const currentBalance = Number(user.credit_balance ?? 0);
                await user.update({
                  credit_balance: currentBalance + refundAmount
                }, { transaction: t });

                await models.credit_transaction.create({
                  id_utilisateur: userId,
                  nombre: refundAmount,
                  type: `refund:valid_match_override:R${competingMatch.id}:U${userId}`,
                  date_creation: new Date()
                }, { transaction: t });

                console.log(`[ParticipantController] ✅ Refunded ${refundAmount} to user ${userId}`);
              }
            }
          }

          // Delete participants
          if (competingParticipants.length > 0) {
            await models.participant.destroy({
              where: { id_reservation: competingMatch.id },
              transaction: t
            });
          }

          // Send notifications
          for (const userId of usersToRefund) {
            try {
              await models.addNotification(userId, {
                type: 'reservation_cancelled',
                title: 'Réservation annulée',
                message: `Votre match ouvert a été annulé car un autre match a atteint 4 joueurs.`,
                data: {
                  cancelledReservationId: competingMatch.id,
                  newReservationId: id_reservation
                }
              });
            } catch (err) {
              console.warn('[ParticipantController] Failed to send notification:', err);
            }
          }
        }

        // Mark slot as unavailable
        const plageHoraire = await models.plage_horaire.findByPk(reservation.id_plage_horaire, {
          transaction: t,
          lock: t.LOCK.UPDATE
        });

        if (plageHoraire) {
          await plageHoraire.update({ disponible: false }, { transaction: t });
          console.log(`[ParticipantController] Marked slot ${reservation.id_plage_horaire} as unavailable`);
        }
      }

      await t.commit();

      const responseData = {
        success: true,
        message: "Vous avez rejoint le match avec succès",
        participant: result,
        currentPlayers: updatedCount,
        maxPlayers: 4,
        spotsRemaining: 4 - updatedCount
      };

      console.log(`[ParticipantController] Sending success response:`, responseData);
      res.status(201).json(responseData);

    } catch (error) {
      console.error("[ParticipantController] Error creating participant:", error);
      console.error("[ParticipantController] Error stack:", error.stack);
      try { await t.rollback(); } catch { }

      // ════════════════════════════════════════════════════════════════════════
      // RACE CONDITION ERROR HANDLING
      // ════════════════════════════════════════════════════════════════════════

      // Check if this is a unique constraint violation (slot was taken between our check and insert)
      if (error.name === 'SequelizeUniqueConstraintError' ||
        error.original?.code === '23505' || // PostgreSQL unique violation
        error.message?.includes('unique') ||
        error.message?.includes('duplicate') ||
        error.message?.includes('uniq_participant_reservation_team')) {

        console.log(`[ParticipantController] ⚠️ RACE CONDITION DETECTED: Unique constraint violation - slot was taken by another user`);

        return res.status(400).json({
          error: "Désolé, ce créneau a été pris par un autre utilisateur. Veuillez choisir un autre horaire.",
          code: "SLOT_TAKEN_RACE_CONDITION",
          message: "Désolé, ce créneau a été pris par un autre utilisateur. Veuillez choisir un autre horaire.",
          success: false
        });
      }

      // Provide more detailed error response
      const errorResponse = {
        error: error.message || "Une erreur s'est produite",
        code: error.code || "UNKNOWN_ERROR",
        timestamp: new Date().toISOString()
      };

      // Add specific error details for common issues
      if (error.message && error.message.includes("Insufficient credit balance")) {
        errorResponse.code = "INSUFFICIENT_BALANCE";
        errorResponse.error = "Solde de crédit insuffisant";
      } else if (error.message && error.message.includes("already a participant")) {
        errorResponse.code = "ALREADY_PARTICIPANT";
        errorResponse.error = "Vous avez déjà rejoint ce match";
      } else if (error.message && error.message.includes("position")) {
        errorResponse.code = "POSITION_TAKEN";
        errorResponse.error = "Cette position est déjà prise";
      }

      res.status(400).json(errorResponse);
    }
  };

  const findAll = async (req, res) => {
    try {
      const participants = await Participant.findAll({
        include: [{
          model: models.utilisateur,
          as: 'utilisateur',
          attributes: ['id', 'nom', 'prenom', 'email',]
        }]
      });
      res.json(participants);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  const findById = async (req, res) => {
    try {
      const participant = await Participant.findByPk(req.params.id);
      if (!participant) return res.status(404).json({ error: "Participant not found" });
      res.json(participant);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  const update = async (req, res) => {
    try {
      const [updated] = await Participant.update(req.body, { where: { id: req.params.id } });
      if (!updated) return res.status(404).json({ error: "Participant not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  const remove = async (req, res) => {
    const t = await models.sequelize.transaction();

    try {
      // Get participant info before deleting
      const participant = await Participant.findByPk(req.params.id, {
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!participant) {
        await t.rollback();
        return res.status(404).json({ error: "Participant not found" });
      }

      const reservationId = participant.id_reservation;

      // Delete the participant
      const deleted = await Participant.destroy({
        where: { id: req.params.id },
        transaction: t
      });

      if (!deleted) {
        await t.rollback();
        return res.status(404).json({ error: "Participant not found" });
      }

      // Check remaining participants count
      const remainingCount = await Participant.count({
        where: { id_reservation: reservationId },
        transaction: t
      });

      console.log(`[ParticipantController] Participant removed. Remaining: ${remainingCount}/4`);

      // Get reservation to check if it's an open match
      const reservation = await models.reservation.findByPk(reservationId, {
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (reservation) {
        const isOpenMatch = Number(reservation.typer) === 2;
        const isPrivateMatch = Number(reservation.typer) === 1;
        const wasValid = Number(reservation.etat) === 1;

        // ✅ FIX: Revert to pending for BOTH open and private matches when < 4 players
        // A match (any type) is only valid when it has 4 players
        if (wasValid && remainingCount < 4) {
          console.log(`[ParticipantController] Match dropped below 4 players (${remainingCount}/4) - reverting to pending`);

          // etat: 0 = pending (not valid)
          await reservation.update({
            etat: 0,
            date_modif: new Date()
          }, { transaction: t });

          // Re-enable the slot (disponible: true = available)
          if (reservation.id_plage_horaire) {
            const plage = await models.plage_horaire.findByPk(reservation.id_plage_horaire, {
              transaction: t,
              lock: t.LOCK.UPDATE
            });

            if (plage) {
              await plage.update({ disponible: true }, { transaction: t });
              console.log(`[ParticipantController] Slot ${plage.id} re-enabled (disponible=true)`);
            }
          }
        }
      }

      await t.commit();
      res.json({
        success: true,
        remainingPlayers: remainingCount,
        maxPlayers: 4,
        spotsRemaining: 4 - remainingCount
      });

    } catch (error) {
      console.error("[ParticipantController] Error removing participant:", error);
      try { await t.rollback(); } catch { }
      res.status(400).json({ error: error.message });
    }
  };

  const findByReservation = async (req, res) => {
    try {
      const participants = await Participant.findAll({
        where: { id_reservation: req.params.id_reservation },
        include: [{
          model: models.utilisateur,
          as: 'utilisateur',
          attributes: [
            'id',
            'nom',
            'prenom',
            'email',
            // 'numero_telephone',
            'image_url',
            'note',
            'mainprefere'
          ]
        }]
      });
      res.json(participants);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  const checkReservationStatus = async (req, res) => {
    try {
      const count = await Participant.count({ where: { id_reservation: req.params.id_reservation } });
      res.json({
        reservationId: req.params.id_reservation,
        currentPlayers: count,
        maxPlayers: 4,
        spotsRemaining: 4 - count
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  return {
    create,
    findAll,
    findById,
    update,
    remove,
    findByReservation,
    checkReservationStatus
  };
}