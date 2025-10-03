export default function VerificationEmailController(service) {
  const sendVerification = async (req, res) => {
    try {
      const result = await service.create(req.body);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

  const verifyToken = async (req, res) => {
    try {
      const { id_utilisateur, token } = req.body;
      const result = await service.verify(id_utilisateur, token);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

  return {
    sendVerification,
    verifyToken,
  };
}
