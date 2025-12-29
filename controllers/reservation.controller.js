export default function ReservationController(service) {
  const create = async (req, res) => {
    try {
      const data = await service.create(req.body);
      res.status(201).json(data);
    } catch (error) {
      const isConflict = error?.name === 'ReservationConflictError' || /créneau.*réservé/i.test(error?.message ?? '');
      res.status(isConflict ? 409 : 400).json({ error: error.message });
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
      if (!data) return res.status(404).json({ error: 'Not found' });
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

  const findMine = async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const data = await service.findByUserId(userId);
      res.json(data);
    } catch (error) {
      console.error('[findMine] Error:', error?.message, error);
      res.status(500).json({ error: error.message });
    }
  };

  const findByCode = async (req, res) => {
    try {
      const code = req.params.code;
      const data = await service.findOne({ coder: code });
      if (!data) return res.status(404).json({ error: 'Not found' });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const findByDate = async (req, res) => {
    try {
      const dateStr = req.params.date;
      const data = await service.findByDate(dateStr);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const findAvailableByDate = async (req, res) => {
    try {
      const dateStr = req.params.date;
      const data = await service.findAvailableByDate(dateStr);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const cancel = async (req, res) => {
    try {
      const id = req.params.id;
      
      // ════════════════════════════════════════════════════════════════════════
      // Get userId from request body OR from JWT token
      // ════════════════════════════════════════════════════════════════════════
      let userId = req.body?.userId;
      
      // Fallback to JWT token if not in body
      if (!userId && req.user) {
        userId = req.user.id || req.user.userId;
      }
      
      console.log(`[Cancel] Incoming request: id=${id}, userId=${userId}`);  // ← FIXED: Added missing parentheses
      
      if (!userId) {
        return res.status(400).json({ error: 'userId is required to cancel a reservation' });
      }
      
      const data = await service.cancel(id, userId);
      res.json({ success: true, reservation: data });
    } catch (error) {
      console.error('[Cancel] Failed:', error?.message, error);
      const isConflict = error?.name === 'LateCancellationError' || error?.name === 'MatchStatusConflictError';
      res.status(isConflict ? 409 : 400).json({ error: error.message });
    }
  };

  return {
    create,
    findAll,
    findById,
    update,
    remove,
    findMine,
    findByCode,
    findByDate,
    findAvailableByDate,
    cancel,
  };
}