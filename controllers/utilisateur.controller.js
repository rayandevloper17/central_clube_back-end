// controllers/utilisateur.controller.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
export default (models) => {
  const { utilisateur } = models;

  return {
    // Retrieve all users
    getAll: async (req, res, next) => {
      try {
        const users = await utilisateur.findAll();
        res.json(users);
      } catch (err) {
        next(err);
      }
    },

    // Get user by ID
    getById: async (req, res, next) => {
      try {
        const user = await utilisateur.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
        res.json(user);
      } catch (err) {
        next(err);
      }
    },

    // Create new user (hash password)
    create: async (req, res, next) => {
      try {
        const { mot_de_passe, email } = req.body;
        
        // Generate salt and hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(mot_de_passe, salt);
        
        // Create user with hashed password
        const user = await utilisateur.create({
          ...req.body,
          mot_de_passe: hashedPassword,
          salt: salt // Store salt separately for additional security
        });

        // Return user data without sensitive information
        res.status(201).json({
          id: user.id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom
        });
      } catch (err) {
        next(err);
      }
    },

    // creta function creditCalculateSubmit


    // User login
    login: async (req, res, next) => {
      try {
        const { email, mot_de_passe } = req.body;

        // Find user by email
        const user = await utilisateur.findOne({ where: { email } });
        if (!user) {
          return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Compare passwords
        const isValidPassword = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
        if (!isValidPassword) {
          return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Generate JWT tokens
        const accessToken = jwt.sign(
          { id: user.id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '15m' } // Short-lived access token
        );

        const refreshToken = jwt.sign(
          { id: user.id, email: user.email, type: 'refresh' },
          process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh',
          { expiresIn: '7d' } // Long-lived refresh token
        );

        // Store refresh token in database (you might want to add a refresh_token field to user model)
        await user.update({ refresh_token: refreshToken });

        res.json({
          accessToken,
          refreshToken,
          expiresIn: 900, // 15 minutes in seconds
          tokenType: 'Bearer',
          user: {
            id: user.id,
            email: user.email,
            nom: user.nom,
            prenom: user.prenom
          }
        });
      } catch (err) {
        next(err);
      }
    },

    // Refresh token endpoint
    refreshToken: async (req, res, next) => {
      try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
          return res.status(401).json({ 
            message: 'Refresh token requis',
            error: 'REFRESH_TOKEN_MISSING' 
          });
        }

        // Verify refresh token
        const decoded = jwt.verify(
          refreshToken, 
          process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh'
        );

        // Check if it's a refresh token
        if (decoded.type !== 'refresh') {
          return res.status(401).json({ 
            message: 'Token invalide',
            error: 'INVALID_TOKEN_TYPE' 
          });
        }

        // Find user and verify refresh token matches stored token
        const user = await utilisateur.findByPk(decoded.id);
        if (!user || user.refresh_token !== refreshToken) {
          return res.status(401).json({ 
            message: 'Refresh token invalide ou expiré',
            error: 'INVALID_REFRESH_TOKEN' 
          });
        }

        // Generate new access token
        const newAccessToken = jwt.sign(
          { id: user.id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '15m' }
        );

        // Optionally generate new refresh token (rotate refresh tokens for better security)
        const newRefreshToken = jwt.sign(
          { id: user.id, email: user.email, type: 'refresh' },
          process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh',
          { expiresIn: '7d' }
        );

        // Update stored refresh token
        await user.update({ refresh_token: newRefreshToken });

        res.json({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresIn: 900, // 15 minutes in seconds
          tokenType: 'Bearer',
          message: 'Token rafraîchi avec succès'
        });

      } catch (err) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
          return res.status(401).json({ 
            message: 'Refresh token invalide ou expiré',
            error: 'INVALID_REFRESH_TOKEN' 
          });
        }
        next(err);
      }
    },

    // Logout endpoint (invalidate refresh token)
    logout: async (req, res, next) => {
      try {
        const { refreshToken } = req.body;
        
        if (refreshToken) {
          // Find user by refresh token and clear it
          const user = await utilisateur.findOne({ where: { refresh_token: refreshToken } });
          if (user) {
            await user.update({ refresh_token: null });
          }
        }

        res.json({ 
          message: 'Déconnexion réussie',
          success: true 
        });
      } catch (err) {
        next(err);
      }
    },

// Enhanced update function - handles user info AND credit operations
update: async (req, res, next) => {
  try {
    const user = await utilisateur.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    
    // Handle password hashing if password is being updated
    if (req.body.mot_de_passe) {
      const salt = await bcrypt.genSalt(10);
      req.body.mot_de_passe = await bcrypt.hash(req.body.mot_de_passe, salt);
    }
    
    // Handle credit operations if requested
    if (req.body.creditOperation) {
      const { creditOperation, creditAmount, creditType, sport } = req.body;
      
      if (creditOperation === 'deduct') {
        // Determine which credit field to update
        let currentCredit;
        let creditField;
        
        if (creditType === 'gold') {
          if (sport === 'padel') {
            currentCredit = user.credit_gold_padel || 0;
            creditField = 'credit_gold_padel';
          } else if (sport === 'soccer') {
            currentCredit = user.credit_gold_soccer || 0;
            creditField = 'credit_gold_soccer';
          } else {
            return res.status(400).json({ message: 'Sport invalide. Utilisez "padel" ou "soccer"' });
          }
        } else if (creditType === 'silver') {
          if (sport === 'padel') {
            currentCredit = user.credit_silver_padel || 0;
            creditField = 'credit_silver_padel';
          } else if (sport === 'soccer') {
            currentCredit = user.credit_silver_soccer || 0;
            creditField = 'credit_silver_soccer';
          } else {
            return res.status(400).json({ message: 'Sport invalide. Utilisez "padel" ou "soccer"' });
          }
        } else {
          return res.status(400).json({ message: 'Type de crédit invalide. Utilisez "gold" ou "silver"' });
        }
        
        // Verify user has enough credit
        if (currentCredit < creditAmount) {
          return res.status(400).json({ 
            message: `Solde de crédit ${creditType} insuffisant pour ${sport}`,
            currentBalance: currentCredit,
            requested: creditAmount,
            deficit: creditAmount - currentCredit
          });
        }
        
        // Calculate new credit balance and add to update object
        const newCreditBalance = currentCredit - creditAmount;
        req.body[creditField] = newCreditBalance;
        
        // Remove credit operation fields from body so they don't get saved to DB
        delete req.body.creditOperation;
        delete req.body.creditAmount;
        delete req.body.creditType;
        delete req.body.sport;
        
      } else if (creditOperation === 'add') {
        // Handle adding credits
        let currentCredit;
        let creditField;
        
        if (creditType === 'gold') {
          if (sport === 'padel') {
            currentCredit = user.credit_gold_padel || 0;
            creditField = 'credit_gold_padel';
          } else if (sport === 'soccer') {
            currentCredit = user.credit_gold_soccer || 0;
            creditField = 'credit_gold_soccer';
          } else {
            return res.status(400).json({ message: 'Sport invalide. Utilisez "padel" ou "soccer"' });
          }
        } else if (creditType === 'silver') {
          if (sport === 'padel') {
            currentCredit = user.credit_silver_padel || 0;
            creditField = 'credit_silver_padel';
          } else if (sport === 'soccer') {
            currentCredit = user.credit_silver_soccer || 0;
            creditField = 'credit_silver_soccer';
          } else {
            return res.status(400).json({ message: 'Sport invalide. Utilisez "padel" ou "soccer"' });
          }
        } else {
          return res.status(400).json({ message: 'Type de crédit invalide. Utilisez "gold" ou "silver"' });
        }
        
        // Add credits
        const newCreditBalance = currentCredit + creditAmount;
        req.body[creditField] = newCreditBalance;
        
        // Remove credit operation fields from body
        delete req.body.creditOperation;
        delete req.body.creditAmount;
        delete req.body.creditType;
        delete req.body.sport;
      }
    }
    
    // Always update the modification timestamp
    req.body.date_misajour = new Date();
    
    // Update user with all changes
    await user.update(req.body);
    
    // Return updated user (excluding sensitive information)
    const { mot_de_passe, salt, ...userResponse } = user.toJSON();
    res.json({
      success: true,
      user: userResponse,
      message: 'Utilisateur mis à jour avec succès'
    });
    
  } catch (err) {
    console.error('Error in update:', err);
    next(err);
  }
 },



    // Delete user
    delete: async (req, res, next) => {
      try {
        const user = await utilisateur.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
        await user.destroy();
        res.status(204).send();
      } catch (err) {
        next(err);
      }
    },
  };
};
