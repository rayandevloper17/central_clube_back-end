export default function ReservationController(service) {
  const create = async (req, res) => {
    try {
      const reservation = await service.create(req.body);
      res.status(201).json(reservation);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

  
  const historyForMe = async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          error: 'Token invalide',
          message: 'Token malformé ou invalide',
          code: 'ACCESS_TOKEN_INVALID'
        });
      }

      const list = await service.findByUserId(userId);
      if (!list || list.length === 0) {
        return res.status(404).json({ message: 'Historique vide' });
      }

      res.json(list);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

const findByCode = async (req, res) => {
  try {
    // route is /code/:code -> param name is `code`
    const { code } = req.params;

    console.debug('[ReservationController] findByCode called with code=', code);

    if (!code) {
      return res.status(400).json({ error: "Reservation code is required", code: 4001 });
    }

    // The DB field is named `coder`, so query by that field
    const reservation = await service.findOne({ coder: code });

  console.debug('[ReservationController] findByCode result=', !!reservation, reservation ? reservation.id : null);

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found", code: 4041 });
    }

    res.json(reservation);
  } catch (err) {
    res.status(500).json({ error: "Internal server error", code: 5001, details: err.message });
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

  // NEW: find by date (YYYY-MM-DD)
  const findByDate = async (req, res) => {
    try {
      const { date } = req.params;
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
      }
      const list = await service.findByDate(date);
      // Return 200 with empty array if none
      res.json(list || []);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  // NEW: available (not full) by date
  const findAvailableByDate = async (req, res) => {
    try {
      const { date } = req.params;
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
      }
      const list = await service.findAvailableByDate(date);
      res.json(list || []);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  // NEW: available (not full) across all dates
  const findAvailableAll = async (_req, res) => {
    try {
      const list = await service.findAvailableAll();
      res.json(list || []);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  const findById = async (req, res) => {
    try {
      const { id } = req.params;

      console.debug('[ReservationController] findById called with id=', id);

      // Try primary id lookup first
      let item = await service.findById(id);
      console.debug('[ReservationController] findById findById result=', !!item, item ? item.id : null);

      // If not found, it's possible the client passed the reservation 'coder' instead
      if (!item) {
        item = await service.findOne({ coder: id });
        console.debug('[ReservationController] findById findOne by coder result=', !!item, item ? item.id : null);
      }

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
    historyForMe,
    findAll,
    findByCode,
    findById,
    update,
    remove,
    findByDate,
    findAvailableByDate,
    findAvailableAll,
  };
}
