/**
 * ════════════════════════════════════════════════════════════════════════════════
 * MEMBERSHIP ROUTES - API endpoints for membership operations
 * ════════════════════════════════════════════════════════════════════════════════
 */

import express from 'express';
import MembershipController from '../controllers/membership.controller.js';
import MembershipService from '../services/membership.service.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

export default function createMembershipRoutes(models) {
    const router = express.Router();
    const membershipService = MembershipService(models);
    const membershipController = MembershipController(membershipService);

    // ════════════════════════════════════════════════════════════════════════
    // Membership CRUD endpoints
    // ════════════════════════════════════════════════════════════════════════

    /**
     * POST /api/memberships
     * Create a new membership
     */
    router.post('/', authenticateToken, membershipController.create);

    /**
     * GET /api/memberships/user/:userId/club/:clubId
     * Get active membership for a user and club (with expiry check)
     */
    router.get('/user/:userId/club/:clubId', authenticateToken, membershipController.getByUserAndClub);

    /**
     * GET /api/memberships/user/:userId
     * Get all memberships for a user
     */
    router.get('/user/:userId', authenticateToken, membershipController.getAllByUser);

    /**
     * GET /api/memberships/rules/:type
     * Get membership rules for a specific type (0-4)
     */
    router.get('/rules/:type', membershipController.getRules);

    /**
     * GET /api/memberships/usage/:userId/:date
     * Check if user has used their daily limit for a specific date
     */
    router.get('/usage/:userId/:date', authenticateToken, membershipController.getDailyUsageStatus);


    /**
     * DEBUG: GET /api/memberships/all
     * Get ALL memberships (for debugging)
     */
    router.get('/all', authenticateToken, membershipController.getAllMemberships);

    /**
     * GET /api/memberships/:id
     * Get membership by ID
     */
    router.get('/:id', authenticateToken, membershipController.getById);

    /**
     * PUT /api/memberships/:id
     * Update a membership
     */
    router.put('/:id', authenticateToken, membershipController.update);

    /**
     * DELETE /api/memberships/:id
     * Delete a membership
     */
    router.delete('/:id', authenticateToken, membershipController.remove);

    /**
     * POST /api/memberships/purchase
     * Purchase a membership
     */
    router.post('/purchase', authenticateToken, membershipController.purchase);

    return router;
}
