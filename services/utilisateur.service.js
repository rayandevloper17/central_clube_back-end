import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default (models) => {
  const { utilisateur } = models;

  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET + '_refresh';
  const SALT_ROUNDS = 10;

  return {
    findAll: () => utilisateur.findAll(),

    findById: (id) => utilisateur.findByPk(id),

    create: async (data) => {
      // Hash password before creating user
      if (data.mot_de_passe) {
        data.mot_de_passe = await bcrypt.hash(data.mot_de_passe, SALT_ROUNDS);
      }
      return utilisateur.create(data);
    },

    update: async (id, data) => {
      const user = await utilisateur.findByPk(id);
      if (!user) throw new Error('Utilisateur non trouvé');

      if (data.mot_de_passe) {
        data.mot_de_passe = await bcrypt.hash(data.mot_de_passe, SALT_ROUNDS);
      }
      return user.update(data);
    },

    delete: async (id) => {
      const user = await utilisateur.findByPk(id);
      if (!user) throw new Error('Utilisateur non trouvé');
      return user.destroy();
    },

    signup: async (data) => {
      // Check if user already exists by email
      const existingUser = await utilisateur.findOne({ where: { email: data.email } });
      if (existingUser) {
        throw new Error('Email déjà utilisé');
      }
      // Hash password
      data.mot_de_passe = await bcrypt.hash(data.mot_de_passe, SALT_ROUNDS);
      // Create new user
      const newUser = await utilisateur.create(data);
      // Generate JWT token
      const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '1h' });
      return { user: newUser, token };
    },

    login: async (email, mot_de_passe) => {
      const user = await utilisateur.findOne({ where: { email } });
      if (!user) {
        throw new Error('Email ou mot de passe incorrect');
      }
      const isValidPassword = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
      if (!isValidPassword) {
        throw new Error('Email ou mot de passe incorrect');
      }
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
      return { user, token };
    },

    // Token service methods
    generateTokens: (userId, email) => {
      const accessToken = jwt.sign(
        { id: userId, email },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { id: userId, email, type: 'refresh' },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      return { accessToken, refreshToken };
    },

    verifyAccessToken: (token) => {
      try {
        return jwt.verify(token, JWT_SECRET);
      } catch (error) {
        throw new Error('Token d\'accès invalide');
      }
    },

    verifyRefreshToken: (token) => {
      try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
        if (decoded.type !== 'refresh') {
          throw new Error('Type de token invalide');
        }
        return decoded;
      } catch (error) {
        throw new Error('Refresh token invalide');
      }
    },

    storeRefreshToken: async (userId, refreshToken) => {
      const user = await utilisateur.findByPk(userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }
      return user.update({ refresh_token: refreshToken });
    },

    validateRefreshToken: async (refreshToken) => {
      try {
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        
        if (decoded.type !== 'refresh') {
          throw new Error('Type de token invalide');
        }

        // Check if token exists in database
        const user = await utilisateur.findOne({ 
          where: { 
            id: decoded.id, 
            refresh_token: refreshToken 
          } 
        });

        if (!user) {
          throw new Error('Refresh token non trouvé ou expiré');
        }

        return { user, decoded };
      } catch (error) {
        throw new Error('Refresh token invalide ou expiré');
      }
    },

    revokeRefreshToken: async (userId) => {
      const user = await utilisateur.findByPk(userId);
      if (user) {
        return user.update({ refresh_token: null });
      }
    },

    revokeAllUserTokens: async (userId) => {
      // This would revoke all refresh tokens for a user
      // Useful for logout from all devices
      return utilisateur.update(
        { refresh_token: null },
        { where: { id: userId } }
      );
    },
  };
};
