// controllers/credit.controller.js
import jwt from 'jsonwebtoken';

export default (models) => {
  const { utilisateur } = models;

  return {
    // SSE endpoint for real-time credit balance updates
    streamCreditBalance: async (req, res) => {
      try {
        // Verify token from query parameter (fallback to Authorization header for SSE)
        let token = req.query.token;
        
        // If no token in query, check Authorization header
        if (!token) {
          const authHeader = req.headers['authorization'];
          token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        }
        
        if (!token) {
          return res.status(401).json({ 
            error: 'Token d\'accès requis',
            message: 'Veuillez vous connecter pour accéder à cette ressource',
            code: 'ACCESS_TOKEN_MISSING'
          });
        }

        let userId;
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.id;
        } catch (err) {
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

        // Set up SSE headers
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Cache-Control',
        });

        // Send initial credit balance
        const user = await utilisateur.findByPk(userId, {
          attributes: ['id', 'credit_balance', 'credit_gold_padel', 'credit_gold_soccer', 'credit_silver_padel', 'credit_silver_soccer']
        });

        if (!user) {
          res.write(`data: ${JSON.stringify({ error: 'Utilisateur non trouvé' })}\n\n`);
          res.end();
          return;
        }

        // Send initial data
        const creditData = {
          credit_balance: user.credit_balance || 0,
          credit_gold_padel: user.credit_gold_padel || 0,
          credit_gold_soccer: user.credit_gold_soccer || 0,
          credit_silver_padel: user.credit_silver_padel || 0,
          credit_silver_soccer: user.credit_silver_soccer || 0,
          timestamp: new Date().toISOString()
        };

        res.write(`data: ${JSON.stringify(creditData)}\n\n`);
        res.flush();

        // Set up periodic updates every 30 seconds
        const intervalId = setInterval(async () => {
          try {
            const updatedUser = await utilisateur.findByPk(userId, {
              attributes: ['id', 'credit_balance', 'credit_gold_padel', 'credit_gold_soccer', 'credit_silver_padel', 'credit_silver_soccer']
            });

            if (updatedUser) {
              const updatedCreditData = {
                credit_balance: updatedUser.credit_balance || 0,
                credit_gold_padel: updatedUser.credit_gold_padel || 0,
                credit_gold_soccer: updatedUser.credit_gold_soccer || 0,
                credit_silver_padel: updatedUser.credit_silver_padel || 0,
                credit_silver_soccer: updatedUser.credit_silver_soccer || 0,
                timestamp: new Date().toISOString()
              };

              res.write(`data: ${JSON.stringify(updatedCreditData)}\n\n`);
              res.flush();
            }
          } catch (error) {
            console.error('Error fetching credit data:', error);
            res.write(`data: ${JSON.stringify({ error: 'Erreur lors de la récupération des données de crédit' })}\n\n`);
          }
        }, 30000);

        // Clean up on client disconnect
        req.on('close', () => {
          clearInterval(intervalId);
          console.log(`SSE connection closed for user ${userId}`);
        });

        req.on('error', () => {
          clearInterval(intervalId);
          console.log(`SSE connection error for user ${userId}`);
        });

      } catch (error) {
        console.error('SSE setup error:', error);
        res.status(500).json({ message: 'Erreur lors de la configuration du stream' });
      }
    }
  };
};