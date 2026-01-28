/**
 * ════════════════════════════════════════════════════════════════════════════════
 * RESERVATION CONTROLLER - Handles HTTP requests with proper error codes
 * ════════════════════════════════════════════════════════════════════════════════
 */

import createMembershipHelpers from '../utils/membershipHelpers.js';

export default function ReservationController(reservationService, models) {
  // Initialize membership helpers if models are provided
  const membershipHelpers = models ? createMembershipHelpers(models) : null;

  /**
   * POST /reservations
   * Creates a new reservation with race condition protection
   */
  const create = async (req, res) => {
    try {
      const reservation = await reservationService.create(req.body);

      return res.status(201).json(reservation);

    } catch (error) {
      console.error('[ReservationController] Create error:', error.message);

      // ════════════════════════════════════════════════════════════════════════
      // HTTP 409 CONFLICT - Slot already booked
      // ════════════════════════════════════════════════════════════════════════
      // This happens when:
      // 1. Another user booked the slot (unique constraint violation)
      // 2. Serialization conflict (two concurrent transactions)
      // 3. Slot was already marked as unavailable
      // ════════════════════════════════════════════════════════════════════════
      if (error.statusCode === 409 ||
        error.name === 'SequelizeUniqueConstraintError' ||
        error.parent?.code === '23505' ||  // PostgreSQL unique violation
        error.parent?.code === '40001' ||  // Serialization failure
        error.parent?.code === '40P01') {  // Deadlock detected

        return res.status(409).json({
          error: error.message || 'Ce créneau horaire a déjà été réservé. Veuillez choisir un autre créneau.',
          code: 'SLOT_ALREADY_BOOKED'
        });
      }

      // ════════════════════════════════════════════════════════════════════════
      // HTTP 400 BAD REQUEST - Validation errors
      // ════════════════════════════════════════════════════════════════════════
      if (error.message?.includes('Insufficient balance') ||
        error.message?.includes('Rating range') ||
        error.message?.includes('borne minimale') ||
        error.message?.includes('borne maximale') ||
        error.message?.includes('not found')) {

        return res.status(400).json({
          error: error.message,
          code: 'VALIDATION_ERROR'
        });
      }

      // ════════════════════════════════════════════════════════════════════════
      // HTTP 500 INTERNAL SERVER ERROR - Unknown errors
      // ════════════════════════════════════════════════════════════════════════
      return res.status(500).json({
        error: 'Une erreur est survenue lors de la création de la réservation.',
        code: 'INTERNAL_ERROR'
      });
    }
  };

  /**
   * GET /reservations
   */
  const findAll = async (req, res) => {
    try {
      const reservations = await reservationService.findAll();
      return res.status(200).json(reservations);
    } catch (error) {
      console.error('[ReservationController] FindAll error:', error.message);
      return res.status(500).json({ error: 'Failed to fetch reservations' });
    }
  };

  /**
   * GET /reservations/:id
   */
  const findById = async (req, res) => {
    try {
      const reservation = await reservationService.findById(req.params.id);
      if (!reservation) {
        return res.status(404).json({ error: 'Reservation not found' });
      }
      return res.status(200).json(reservation);
    } catch (error) {
      console.error('[ReservationController] FindById error:', error.message);
      return res.status(500).json({ error: 'Failed to fetch reservation' });
    }
  };

  /**
   * GET /reservations/user/:userId
   */
  const findByUserId = async (req, res) => {
    try {
      const reservations = await reservationService.findByUserId(req.params.userId);
      return res.status(200).json(reservations);
    } catch (error) {
      console.error('[ReservationController] FindByUserId error:', error.message);
      return res.status(500).json({ error: 'Failed to fetch reservations' });
    }
  };

  /**
   * GET /reservations/date/:date
   */
  const findByDate = async (req, res) => {
    try {
      const reservations = await reservationService.findByDate(req.params.date);
      return res.status(200).json(reservations);
    } catch (error) {
      console.error('[ReservationController] FindByDate error:', error.message);
      return res.status(500).json({ error: 'Failed to fetch reservations' });
    }
  };

  /**
   * GET /reservations/available/:date
   */
  const findAvailableByDate = async (req, res) => {
    try {
      const reservations = await reservationService.findAvailableByDate(req.params.date);
      return res.status(200).json(reservations);
    } catch (error) {
      console.error('[ReservationController] FindAvailableByDate error:', error.message);
      return res.status(500).json({ error: 'Failed to fetch available reservations' });
    }
  };

  /**
   * PUT /reservations/:id
   */
  const update = async (req, res) => {
    try {
      const reservation = await reservationService.update(req.params.id, req.body);
      return res.status(200).json(reservation);
    } catch (error) {
      console.error('[ReservationController] Update error:', error.message);
      if (error.message === 'Reservation not found') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Failed to update reservation' });
    }
  };

  /**
   * DELETE /reservations/:id
   */
  const remove = async (req, res) => {
    try {
      await reservationService.remove(req.params.id);
      return res.status(200).json({ message: 'Reservation deleted' });
    } catch (error) {
      console.error('[ReservationController] Remove error:', error.message);
      if (error.message === 'Reservation not found') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Failed to delete reservation' });
    }
  };

  /**
   * POST /reservations/:id/cancel
   * Cancels a reservation (with refunds)
   */
  const cancel = async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body; // The user requesting cancellation

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const reservation = await reservationService.cancel(id, userId);
      return res.status(200).json(reservation);

    } catch (error) {
      console.error('[ReservationController] Cancel error:', error.message);

      if (error.message === 'Reservation not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message?.includes('not a participant')) {
        return res.status(403).json({ error: error.message });
      }

      return res.status(500).json({ error: 'Failed to cancel reservation' });
    }
  };

  /**
   * POST /reservations/process-refunds
   * Admin endpoint to process batch refunds
   */
  const processRefunds = async (req, res) => {
    try {
      const result = await reservationService.processStatusRefunds();
      return res.status(200).json(result);
    } catch (error) {
      console.error('[ReservationController] ProcessRefunds error:', error.message);
      return res.status(500).json({ error: 'Failed to process refunds' });
    }
  };

  /**
   * GET /reservations/date-range/:userId/:clubId
   * Get available date range for user based on membership
   */
  const getDateRange = async (req, res) => {
    try {
      if (!membershipHelpers) {
        return res.status(500).json({ error: 'Membership helpers not initialized' });
      }

      const { userId, clubId } = req.params;
      const dateRange = await membershipHelpers.getAvailableDateRange(userId, clubId);
      return res.status(200).json(dateRange);
    } catch (error) {
      console.error('[ReservationController] GetDateRange error:', error.message);
      return res.status(500).json({ error: 'Failed to get date range' });
    }
  };

  /**
   * GET /reservations/can-create-open/:userId/:clubId
   * Check if user can create open match based on membership
   */
  const canCreateOpenMatch = async (req, res) => {
    try {
      if (!membershipHelpers) {
        return res.status(500).json({ error: 'Membership helpers not initialized' });
      }

      const { userId, clubId } = req.params;
      const permission = await membershipHelpers.canCreateOpenMatch(userId, clubId);
      return res.status(200).json(permission);
    } catch (error) {
      console.error('[ReservationController] CanCreateOpenMatch error:', error.message);
      return res.status(500).json({ error: 'Failed to check permission' });
    }
  };


  // ════════════════════════════════════════════════════════════════════════════
  // SCORE MANAGEMENT (NEW)
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * PUT /reservations/:id/score
   */
  const updateScore = async (req, res) => {
    try {
      const { id } = req.params;
      const { submitter_id } = req.body; // Or from req.user

      // req.body should match expected structure: 
      // { set1: {a,b}, set2: {a,b}, set3: {a,b}, set3_mode: '...' }

      const result = await reservationService.updateScore(id, req.body, submitter_id || req.user?.id);
      return res.status(200).json(result);
    } catch (error) {
      console.error('[ReservationController] UpdateScore error:', error.message);

      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('Invalid') || error.message.includes('required')) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message.includes('locked') || error.message.includes('confirmed')) {
        return res.status(409).json({ error: error.message });
      }

      return res.status(500).json({ error: 'Failed to update score' });
    }
  };

  /**
   * POST /reservations/finalize-pending-scores
   */
  const finalizePendingScores = async (req, res) => {
    try {
      const result = await reservationService.finalizePendingScores();
      return res.status(200).json(result);
    } catch (error) {
      console.error('[ReservationController] FinalizePendingScores error:', error.message);
      return res.status(500).json({ error: 'Failed to finalize scores' });
    }
  };

  /**
   * POST /reservations/validate-cancellation
   * Validate if user can cancel based on membership timing rules
   * Body: { userId, clubId, matchDate, matchTime }
   */
  const validateCancellation = async (req, res) => {
    try {
      if (!membershipHelpers) {
        return res.status(500).json({ error: 'Membership helpers not initialized' });
      }

      const { userId, clubId, matchDate, matchTime } = req.body;

      if (!userId || !clubId || !matchDate) {
        return res.status(400).json({ error: 'userId, clubId, and matchDate are required' });
      }

      const validation = await membershipHelpers.validateCancellationTiming(
        userId,
        clubId,
        matchDate,
        matchTime
      );

      return res.status(200).json(validation);
    } catch (error) {
      console.error('[ReservationController] ValidateCancellation error:', error.message);
      return res.status(500).json({ error: 'Failed to validate cancellation' });
    }
  };

  return {
    create,
    findAll,
    findById,
    findByUserId,
    findByDate,
    findAvailableByDate,
    update,
    remove,
    cancel,
    processRefunds,
    getDateRange,
    canCreateOpenMatch,
    validateCancellation,
    updateScore,
    finalizePendingScores,
  };
}