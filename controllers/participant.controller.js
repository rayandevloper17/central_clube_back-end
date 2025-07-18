// controllers/participant.controller.js
export default function ParticipantController(service) {
  const create = async (req, res) => {
    try {
      const result = await service.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  const findAll = async (req, res) => {
    try {
      const results = await service.findAll();
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const findById = async (req, res) => {
    try {
      const result = await service.findById(req.params.id);
      if (!result) return res.status(404).json({ error: "Not found" });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const update = async (req, res) => {
    try {
      const result = await service.update(req.params.id, req.body);
      res.json(result);
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

  return {
    create,
    findAll,
    findById,
    update,
    remove,
  };
}
