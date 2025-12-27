export default function ReservationController(service) {
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
      const userId = req.user?.id;
      console.log(`[Cancel] Incoming request: id=${id}, userId=${userId}`);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const data = await service.cancel(id, userId);
      res.json({ success: true, reservation: data });
    } catch (error) {
      console.error('[Cancel] Failed:', error?.message, error);
      res.status(400).json({ error: error.message });
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