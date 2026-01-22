/**
 * ════════════════════════════════════════════════════════════════════════════════
 * MEMBERSHIP VALIDATION MIDDLEWARE - Validates membership before operations
 * ════════════════════════════════════════════════════════════════════════════════
 */

import MembershipService from '../services/membership.service.js';

export default function createMembershipMiddleware(models) {
    const membershipService = MembershipService(models);

    /**
     * Check if membership exists and is valid for a user and club
     * Attaches membership data to req.membershipData
     */
    const validateMembership = async (req, res, next) => {
        try {
            const { userId, clubId } = req.params;

            if (!userId || !clubId) {
                return res.status(400).json({ error: 'userId and clubId are required' });
            }

            const membershipData = await membershipService.checkMembershipExpiry(userId, clubId);

            // Attach to request for use in route handlers
            req.membershipData = membershipData;

            next();
        } catch (error) {
            console.error('[MembershipMiddleware] Error validating membership:', error);
            return res.status(500).json({ error: 'Failed to validate membership' });
        }
    };

    /**
     * Check if user has permission to create open match based on membership
     */
    const canCreateOpenMatch = async (req, res, next) => {
        try {
            const { userId, clubId } = req.body;

            if (!userId || !clubId) {
                return res.status(400).json({ error: 'userId and clubId are required  in request body' });
            }

            const membershipData = await membershipService.checkMembershipExpiry(userId, clubId);

            if (!membershipData.rules.canCreateOpenMatch) {
                return res.status(403).json({
                    error: 'Membership required',
                    message: 'Votre type de membre ne vous permet pas de créer des matchs ouverts. Veuillez upgrader votre abonnement.'
                });
            }

            req.membershipData = membershipData;
            next();
        } catch (error) {
            console.error('[MembershipMiddleware] Error checking open match permission:', error);
            return res.status(500).json({ error: 'Failed to check membership permission' });
        }
    };

    /**
     * Apply membership pricing rules to reservation
     * Assumes req.body contains reservation data
     */
    const applyMembershipPricing = async (req, res, next) => {
        try {
            const { id_utilisateur, id_terrain, prix_total } = req.body;

            if (!id_utilisateur || !id_terrain) {
                return next(); // Skip if no user/terrain provided
            }

            // Use id_terrain as clubId (assuming terrain belongs to a club)
            const membershipData = await membershipService.checkMembershipExpiry(id_utilisateur, id_terrain);

            let finalPrice = Number(prix_total || 0);

            // Apply membership rules
            if (membershipData.rules.isFree) {
                // Infinity membership: FREE
                finalPrice = 0;
            } else if (membershipData.rules.priceDiscount > 0) {
                // Gold/Platinum: Apply discount
                finalPrice = Math.max(0, finalPrice - membershipData.rules.priceDiscount);
            }

            // Attach modified price and membership data
            req.body.prix_total = finalPrice;
            req.membershipData = membershipData;
            req.originalPrice = Number(prix_total || 0);

            console.log('[MembershipMiddleware] Applied pricing:', {
                original: req.originalPrice,
                final: finalPrice,
                membershipType: membershipData.type,
                discount: membershipData.rules.priceDiscount
            });

            next();
        } catch (error) {
            console.error('[MembershipMiddleware] Error applying membership pricing:', error);
            return res.status(500).json({ error: 'Failed to apply membership pricing' });
        }
    };

    return {
        validateMembership,
        canCreateOpenMatch,
        applyMembershipPricing
    };
}
