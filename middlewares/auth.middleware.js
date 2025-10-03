// middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Token d\'accès requis',
      message: 'Veuillez vous connecter pour accéder à cette ressource',
      code: 'ACCESS_TOKEN_MISSING'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT verification failed:', err.message);
      
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Token expiré',
          message: 'Votre session a expiré, veuillez utiliser le refresh token ou vous reconnecter',
          code: 'ACCESS_TOKEN_EXPIRED' 
        });
      }
      
      if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({ 
          error: 'Token invalide',
          message: 'Token malformé ou invalide',
          code: 'ACCESS_TOKEN_INVALID'
        });
      }

      return res.status(403).json({ 
        error: 'Erreur d\'authentification',
        message: 'Token invalide ou expiré',
        code: 'ACCESS_TOKEN_ERROR'
      });
    }
    
    req.user = user;
    next();
  });
};

// Middleware to verify refresh token
export const authenticateRefreshToken = (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ 
      error: 'Refresh token requis',
      message: 'Veuillez fournir un refresh token valide',
      code: 'REFRESH_TOKEN_MISSING'
    });
  }

  const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh';

  jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, user) => {
    if (err) {
      console.error('Refresh token verification failed:', err.message);
      
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Refresh token expiré',
          message: 'Votre refresh token a expiré, veuillez vous reconnecter',
          code: 'REFRESH_TOKEN_EXPIRED' 
        });
      }
      
      if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({ 
          error: 'Refresh token invalide',
          message: 'Refresh token malformé ou invalide',
          code: 'REFRESH_TOKEN_INVALID'
        });
      }

      return res.status(403).json({ 
        error: 'Erreur de refresh token',
        message: 'Refresh token invalide ou expiré',
        code: 'REFRESH_TOKEN_ERROR'
      });
    }
    
    if (user.type !== 'refresh') {
      return res.status(403).json({ 
        error: 'Type de token invalide',
        message: 'Ce n\'est pas un refresh token valide',
        code: 'INVALID_TOKEN_TYPE'
      });
    }
    
    req.user = user;
    next();
  });
};

export const authorizeUser = (req, res, next) => {
  const userId = parseInt(req.params.id);
  const authenticatedUserId = parseInt(req.user.id); // Convert to number
  
  console.log('🔍 Authorization check:', {
    requestedUserId: userId,
    authenticatedUserId: authenticatedUserId,
    userIdType: typeof userId,
    authUserIdType: typeof authenticatedUserId,
    areEqual: userId === authenticatedUserId
  });
  
  // Allow users to access their own data only
  if (userId !== authenticatedUserId) {
    return res.status(403).json({ 
      error: 'Accès non autorisé',
      message: 'Vous ne pouvez accéder qu\'à vos propres données',
      debug: {
        requestedId: userId,
        yourId: authenticatedUserId
      }
    });
  }
  
  next();
};

// Optional: Role-based authorization
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Privilèges administrateur requis',
      message: 'Cette action nécessite des privilèges administrateur' 
    });
  }
  next();
};

// Optional: Multiple roles authorization
export const requireRoles = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Privilèges insuffisants',
        message: `Cette action nécessite l'un des rôles suivants: ${roles.join(', ')}` 
      });
    }
    next();
  };
};