export default function ReservationController(service) {
  const create = async (req, res) => {
    try {
      const reservation = await service.create(req.body);
      res.status(201).json(reservation);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

  const findAll = async (req, res) => {
    try {
      const list = await service.findAll();
      res.json(list);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  const findById = async (req, res) => {
    try {
      const item = await service.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Reservation not found" });
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  const update = async (req, res) => {
    try {
      const updated = await service.update(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

  const remove = async (req, res) => {
    try {
      await service.remove(req.params.id);
      res.json({ message: "Reservation deleted" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

  return {
    create,
    findAll,
    findById,
    update,
    remove,
  };
}
