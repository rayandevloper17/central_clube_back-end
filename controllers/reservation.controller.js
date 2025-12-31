/**
 * ════════════════════════════════════════════════════════════════════════════════
 * RESERVATION CONTROLLER - Handles HTTP requests with proper error codes
 * ════════════════════════════════════════════════════════════════════════════════
 */

export default function ReservationController(reservationService) {
  
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
  };
}