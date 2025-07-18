// middlewares/validation.middleware.js
export const validateCreateUser = (req, res, next) => {
  const { nom, email, mot_de_passe } = req.body;
  if (!nom || !email || !mot_de_passe) {
    return res.status(400).json({ message: 'nom, email et mot_de_passe sont requis' });
  }
  next();
};

export const validateUpdateUser = (req, res, next) => {
  const { mot_de_passe } = req.body;
  if (mot_de_passe && mot_de_passe.length < 6) {
    return res.status(400).json({ message: 'mot_de_passe d’au moins 6 caractères' });
  }
  next();
};
