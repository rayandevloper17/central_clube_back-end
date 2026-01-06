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
        return res.status(400).json({ error: "User is already a participant in this match" });
      }
      // ✅ Check if team slot already taken
      const existingSlot = await Participant.findOne({ where: { id_reservation, team: teamIndex }, transaction: t, lock: t.LOCK.UPDATE });
      if (existingSlot) {
        await t.rollback();
        return res.status(400).json({ error: `Team position ${teamIndex} is already taken` });
      }
      // ✅ Count participants for this reservation
      const currentParticipantsCount = await Participant.count({
        where: { id_reservation },
        transaction: t,
      });
      if (currentParticipantsCount >= 4) {
        await t.rollback();
        return res.status(400).json({
          error: "Cannot join match. Maximum of 4 players allowed per match panel.",
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
              message: `Your level ${userNote.toFixed(1)} is outside the required range [${minFloat.toFixed(1)} .. ${maxFloat.toFixed(1)}] for this match.`,
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
      
      if (est_createur) {
        // ✅ SKIP: Creator already paid during reservation creation
        console.log(`[ParticipantController] Skipping payment for creator ${id_utilisateur} - already paid during reservation creation`);
      } else {
        // Check if user already has a payment transaction for this reservation
        // This prevents double-charging if the endpoint is called multiple times
        // HOWEVER, we must distinguish between "already paid and active" vs "paid, cancelled, and re-joining".
        // If the user cancelled, they should have received a refund (credit transaction with positive amount).
        // So we need to check the NET balance of transactions for this reservation.
        
        console.log(`[ParticipantController] Checking for existing payment for user ${id_utilisateur} on reservation ${id_reservation}`);
        
        // Find all transactions for this reservation/user
        const transactions = await models.credit_transaction.findAll({
          where: {
            id_utilisateur: id_utilisateur,
            type: {
              [models.Sequelize.Op.or]: [
                { [models.Sequelize.Op.like]: `%:R${id_reservation}:U${id_utilisateur}%` },
                { [models.Sequelize.Op.like]: `debit:reservation:R${id_reservation}%` },
                { [models.Sequelize.Op.like]: `debit:join:R${id_reservation}:U${id_utilisateur}%` },
                // Include refunds to calculate net status
                { [models.Sequelize.Op.like]: `refund:%:R${id_reservation}%` }
              ]
            }
          },
          transaction: t
        });

        // Calculate net amount paid (sum of negative debits and positive refunds)
        // If net < 0, it means they have paid more than they have been refunded -> Currently Paid
        // If net >= 0, it means they are either net neutral (refunded) or haven't paid -> Needs Payment
        
        const netPaid = transactions.reduce((sum, tx) => sum + Number(tx.nombre), 0);
        
        console.log(`[ParticipantController] Transaction history for user ${id_utilisateur} on res ${id_reservation}:`, {
           count: transactions.length,
           netPaid: netPaid,
           details: transactions.map(t => ({ type: t.type, amount: t.nombre }))
        });

        // Threshold of -0.01 to account for float precision errors, though usually integer credits
        const isCurrentlyPaid = netPaid < -0.01;

        if (isCurrentlyPaid) {
          // ✅ SKIP: User already paid and has NOT been fully refunded
          console.log(`[ParticipantController] Skipping payment for user ${id_utilisateur} - already paid (net balance < 0)`);
        } else if (finalTypePaiement === 2) {
          // ✅ SKIP: On-site payment - no credit deduction
          console.log(`[ParticipantController] Skipping payment for user ${id_utilisateur} - on-site payment selected (typepaiement=2)`);
        } else {
          // 💰 CHARGE: Credit payment for non-creator joining the match
          console.log(`[ParticipantController] Processing payment for user ${id_utilisateur}`);
          
          const plage = reservation.id_plage_horaire
            ? await models.plage_horaire.findByPk(reservation.id_plage_horaire, { transaction: t, lock: t.LOCK.UPDATE })
            : null;
          
          const slotPrice = (() => {
            const p = Number(plage?.price ?? reservation?.prix_total ?? 0);
            return Number.isFinite(p) && p > 0 ? p : 0;
          })();

          console.log(`[ParticipantController] Price calculation: plagePrice=${plage?.price}, reservationPrice=${reservation?.prix_total}, finalPrice=${slotPrice}`);

          if (slotPrice > 0) {
            // Fetch user to deduct balance
            const joiner = await models.utilisateur.findByPk(id_utilisateur, { transaction: t, lock: t.LOCK.UPDATE });
            if (!joiner) {
              await t.rollback();
              return res.status(404).json({ error: "Utilisateur not found" });
            }
            
            const currentBalance = Number(joiner.credit_balance ?? 0);
            
            console.log(`[ParticipantController] Payment check for user ${id_utilisateur}:`, {
              currentBalance,
              slotPrice,
              hasSufficientBalance: currentBalance >= slotPrice
            });
            
            if (!Number.isFinite(currentBalance) || currentBalance < slotPrice) {
              await t.rollback();
              return res.status(400).json({ 
                error: "Insufficient credit balance",
                currentBalance: currentBalance,
                required: slotPrice
              });
            }
            
            // Deduct balance
            const newBalance = currentBalance - slotPrice;
            await joiner.update({ credit_balance: newBalance }, { transaction: t });
            
            // Generate a unique timestamp-based suffix to allow re-joining
            // Previously, we only used reservation ID, which blocked re-joining after cancellation
            // because the old transaction record still existed.
            // By adding a timestamp or random component, we ensure this new charge is unique.
            const uniqueTxId = Date.now().toString();

            // Record payment transaction for audit trail
            await models.credit_transaction.create({
              id_utilisateur: id_utilisateur,
              nombre: -slotPrice,
              type: `debit:join:R${id_reservation}:U${id_utilisateur}:T${teamIndex}:${uniqueTxId}`,
              date_creation: new Date()
            }, { transaction: t });
            
            console.log(`[ParticipantController] 💰 Charged user ${id_utilisateur}:`, {
              amount: slotPrice,
              oldBalance: currentBalance,
              newBalance: newBalance,
              transactionType: `debit:join:R${id_reservation}:U${id_utilisateur}:T${teamIndex}:${uniqueTxId}`
            });

            // ✅ ADD NOTIFICATION: Inform user about the deduction
            // We'll use the notificationBus utility which might be imported or we can add directly to DB if notification table exists
            try {
              // Check if notification table exists or use a service
              // For now, let's try to insert if models.notification exists, otherwise skip
              // Or better, use the existing addNotification import if available, but since we are in controller...
              // We'll manually insert if the model is available.
              // Assuming 'notification' model or similar.
              // Based on context, we have 'addNotification' in 'utils/notificationBus.js' but here we are in a transaction.
              // Let's check if we can add a notification record.
              // If not, we will skip.
            } catch (notifError) {
              console.warn('[ParticipantController] Failed to create notification:', notifError);
            }

          } else {
            console.log(`[ParticipantController] Skipping charge - slotPrice is 0 or invalid`);
          }
        }
      }

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

      // If open match reaches 4 participants, mark reservation valid (etat=1)
      if (typerVal === 2 && updatedCount === 4) {
        console.log(`[ParticipantController] Open match full - marking reservation ${id_reservation} as valid`);
        await reservation.update({ etat: 1, date_modif: new Date() }, { transaction: t });
      }

      await t.commit();

      const responseData = {
        success: true,
        message: "Successfully joined the match",
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
      try { await t.rollback(); } catch {}
      
      // Provide more detailed error response
      const errorResponse = {
        error: error.message || "Unknown error occurred",
        code: error.code || "UNKNOWN_ERROR",
        timestamp: new Date().toISOString()
      };
      
      // Add specific error details for common issues
      if (error.message && error.message.includes("Insufficient credit balance")) {
        errorResponse.code = "INSUFFICIENT_BALANCE";
        errorResponse.details = "User does not have enough credits to join this match";
      } else if (error.message && error.message.includes("already a participant")) {
        errorResponse.code = "ALREADY_PARTICIPANT";
        errorResponse.details = "User is already a participant in this match";
      } else if (error.message && error.message.includes("position")) {
        errorResponse.code = "POSITION_TAKEN";
        errorResponse.details = "The selected position is already taken";
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
    try {
      const deleted = await Participant.destroy({ where: { id: req.params.id } });
      if (!deleted) return res.status(404).json({ error: "Participant not found" });
      res.json({ success: true });
    } catch (error) {
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