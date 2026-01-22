/**
 * ════════════════════════════════════════════════════════════════════════════════
 * MEMBERSHIP CONTROLLER - Handles HTTP requests for membership operations
 * ════════════════════════════════════════════════════════════════════════════════
 */

export default function MembershipController(membershipService) {

    /**
     * POST /memberships/purchase
     * Purchase a membership with credits
     */
    const purchase = async (req, res) => {
        try {
            const { userId, membershipType, paymentMethod } = req.body;

            if (!userId || !membershipType || !paymentMethod) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const result = await membershipService.purchaseMembership(userId, membershipType, paymentMethod);
            return res.status(200).json(result);

        } catch (error) {
            console.error('[MembershipController] Purchase error:', error.message);
            console.error('[MembershipController] Error name:', error.name);

            // Log database-specific errors
            if (error.original) {
                console.error('[MembershipController] Database error:', {
                    code: error.original.code,
                    detail: error.original.detail,
                    constraint: error.original.constraint
                });
            }

            if (error.message === 'Insufficient credit balance') {
                return res.status(400).json({ error: error.message });
            }
            return res.status(500).json({ error: error.message || 'Purchase failed' });
        }
    };

    /**
     * POST /memberships
     * Create a new membership
     */
    const create = async (req, res) => {
        try {
            const membership = await membershipService.createMembership(req.body);
            return res.status(201).json(membership);
        } catch (error) {
            console.error('[MembershipController] Create error:', error.message);

            if (error.message === 'User not found') {
                return res.status(404).json({ error: error.message });
            }

            if (error.message.includes('Invalid membership type')) {
                return res.status(400).json({ error: error.message });
            }

            return res.status(500).json({ error: 'Failed to create membership' });
        }
    };

    /**
     * GET /memberships/user/:userId/club/:clubId
     * Get active membership for a user and club
     */
    const getByUserAndClub = async (req, res) => {
        try {
            const { userId, clubId } = req.params;
            console.log(`[MembershipController] Getting membership for user ${userId}, club ${clubId}`);

            const membershipData = await membershipService.checkMembershipExpiry(userId, clubId);

            console.log('[MembershipController] Membership data:', JSON.stringify(membershipData, null, 2));

            return res.status(200).json(membershipData);
        } catch (error) {
            console.error('[MembershipController] GetByUserAndClub error:', error.message);
            return res.status(500).json({ error: 'Failed to fetch membership' });
        }
    };

    /**
     * GET /memberships/:id
     * Get membership by ID
     */
    const getById = async (req, res) => {
        try {
            const membership = await membershipService.getMembershipById(req.params.id);
            return res.status(200).json(membership);
        } catch (error) {
            console.error('[MembershipController] GetById error:', error.message);

            if (error.message === 'Membership not found') {
                return res.status(404).json({ error: error.message });
            }

            return res.status(500).json({ error: 'Failed to fetch membership' });
        }
    };

    /**
     * GET /memberships/user/:userId
     * Get all memberships for a user
     */
    const getAllByUser = async (req, res) => {
        try {
            const { userId } = req.params;
            const memberships = await membershipService.getAllUserMemberships(userId);
            return res.status(200).json(memberships);
        } catch (error) {
            console.error('[MembershipController] GetAllByUser error:', error.message);
            return res.status(500).json({ error: 'Failed to fetch memberships' });
        }
    };

    /**
     * PUT /memberships/:id
     * Update a membership
     */
    const update = async (req, res) => {
        try {
            const membership = await membershipService.updateMembership(req.params.id, req.body);
            return res.status(200).json(membership);
        } catch (error) {
            console.error('[MembershipController] Update error:', error.message);

            if (error.message === 'Membership not found') {
                return res.status(404).json({ error: error.message });
            }

            if (error.message.includes('Invalid membership type')) {
                return res.status(400).json({ error: error.message });
            }

            return res.status(500).json({ error: 'Failed to update membership' });
        }
    };

    /**
     * DELETE /memberships/:id
     * Delete a membership
     */
    const remove = async (req, res) => {
        try {
            const result = await membershipService.deleteMembership(req.params.id);
            return res.status(200).json(result);
        } catch (error) {
            console.error('[MembershipController] Remove error:', error.message);

            if (error.message === 'Membership not found') {
                return res.status(404).json({ error: error.message });
            }

            return res.status(500).json({ error: 'Failed to delete membership' });
        }
    };

    /**
     * GET /memberships/rules/:type
     * Get membership rules for a specific type
     */
    const getRules = async (req, res) => {
        try {
            const { type } = req.params;
            const rules = membershipService.getMembershipRules(type);
            return res.status(200).json(rules);
        } catch (error) {
            console.error('[MembershipController] GetRules error:', error.message);

            if (error.message.includes('Invalid membership type')) {
                return res.status(400).json({ error: error.message });
            }

            return res.status(500).json({ error: 'Failed to get membership rules' });
        }
    };

    /**
     * GET /memberships/usage/:userId/:date
     * Check if user has used their daily limit for a specific date
     */
    const getDailyUsageStatus = async (req, res) => {
        try {
            const { userId, date } = req.params;
            // Verify if user has used benefit
            // We can reuse the service method we added, but it's internal.
            // Let's modify service to expose it or just use checkMembershipExpiry which now returns limitReached.

            // Actually, checkMembershipExpiry is the best way because it handles all logic.
            // We pass clubId=1 as default if not provided, since membership is usually per club but often global in simple implementation.
            // Or assume clubId=1 for now.

            const status = await membershipService.checkMembershipExpiry(userId, 1, date);

            return res.status(200).json({
                ...status,
                canUseBenefit: !status.limitReached
            });

        } catch (error) {
            console.error('[MembershipController] Daily usage check error:', error);
            return res.status(500).json({ error: 'Failed to check daily usage' });
        }
    };

    /**
     * DEBUG: GET /memberships/all
     * Get ALL memberships from database (for debugging)
     */
    const getAllMemberships = async (req, res) => {
        try {
            console.log('[MembershipController] Fetching ALL memberships from database...');
            const memberships = await membershipService.models.membership.findAll({
                order: [['id', 'ASC']],
                raw: true
            });

            console.log(`[MembershipController] Found ${memberships.length} memberships`);

            return res.status(200).json({
                count: memberships.length,
                memberships: memberships
            });
        } catch (error) {
            console.error('[MembershipController] GetAllMemberships error:', error);
            return res.status(500).json({
                error: 'Failed to get all memberships',
                details: error.message
            });
        }
    };

    return {
        create,
        purchase,
        getByUserAndClub,
        getById,
        getAllByUser,
        update,
        remove,
        getRules,
        getDailyUsageStatus,
        getAllMemberships  // DEBUG
    };
}
