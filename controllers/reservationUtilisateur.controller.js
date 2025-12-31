export default function ReservationUtilisateurController(service, models = null) {
  const create = async (req, res) => {
    try {
      const data = await service.create(req.body);
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  const findAll = async (req, res) => {
    try {
      const data = await service.findAll();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const findById = async (req, res) => {
    try {
      const data = await service.findById(req.params.id);
      if (!data) return res.status(404).json({ error: "Not found" });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  // Find reservations for current authenticated user
  const findByCurrentUser = async (req, res) => {
    try {
      // Get userId from JWT token (set by auth middleware)
      const userId = req.user?.id || req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      const data = await service.findByUserId(userId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  // Find reservation by code
  const findByCode = async (req, res) => {
    try {
      const code = req.params.code;
      
      if (!models) {
        return res.status(500).json({ error: "Models not available" });
      }
      
      // Search in the reservation table, not reservation_utilisateur
      const data = await models.reservation.findOne({ 
        where: { coder: code },
        include: [
          { model: models.terrain, as: 'terrain' },
          { model: models.utilisateur, as: 'utilisateur' },
          { model: models.plage_horaire, as: 'plage_horaire' }
        ]
      });
      
      if (!data) {
        return res.status(404).json({ error: "Reservation not found" });
      }
      
      res.json(data);
    } catch (error) {
      console.error('Error in findByCode:', error);
      res.status(500).json({ error: error.message });
    }
  };

  // Find reservations by date
  const findByDate = async (req, res) => {
    try {
      const dateStr = req.params.date;
      const data = await service.findByDate(dateStr);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  // Find available reservations by date (open matches with < 4 participants)
  const findAvailableByDate = async (req, res) => {
    try {
      const dateStr = req.params.date;
      const data = await service.findAvailableByDate(dateStr);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const update = async (req, res) => {
    try {
      const data = await service.update(req.params.id, req.body);
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  const remove = async (req, res) => {
    try {
      await service.remove(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  // NEW: Cancel reservation with refunds
  const cancel = async (req, res) => {
    try {
      const reservationId = req.params.id;
      
      // Get userId from request body OR from JWT token
      let cancellingUserId = req.body.userId;
      
      // Fallback to JWT token if not in body
      if (!cancellingUserId && req.user) {
        cancellingUserId = req.user.id || req.user.userId;
      }
      
      if (!cancellingUserId) {
        return res.status(400).json({ 
          success: false, 
          error: 'userId is required to cancel a reservation' 
        });
      }
      
      console.log(`[CancelController] Cancelling reservation ${reservationId} by user ${cancellingUserId}`);
      
      // Call the cancel method in service (which handles refunds)
      const result = await service.cancel(reservationId, cancellingUserId);
      
      return res.status(200).json({ 
        success: true, 
        reservation: result,
        message: 'Reservation cancelled and refunds processed'
      });
      
    } catch (error) {
      console.error('[CancelController] Error:', error.message);
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  };

  return {
    create,
    findAll,
    findById,
    findByCurrentUser,
    findByCode,
    findByDate,
    findAvailableByDate,
    update,
    remove,
    cancel,  // NEW: Export cancel method
  };
}