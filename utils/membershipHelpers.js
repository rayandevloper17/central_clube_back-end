/**
 * ════════════════════════════════════════════════════════════════════════════════
 * MEMBERSHIP UTILITIES FOR RESERVATIONS
 * Helper functions to integrate membership logic with reservations
 * ════════════════════════════════════════════════════════════════════════════════
 */

import MembershipService from '../services/membership.service.js';

export default function createMembershipHelpers(models) {
    const membershipService = MembershipService(models);

    /**
     * Get available date range for user based on membership
     * @param {number} userId - User ID
     * @param {number} clubId - Club/Terrain ID
     * @returns {Promise<{days: number, endDate: Date}>}
     */
    const getAvailableDateRange = async (userId, clubId) => {
        try {
            const membershipData = await membershipService.checkMembershipExpiry(userId, clubId);
            const days = membershipData.rules.dateRangeDays;

            const today = new Date();
            const endDate = new Date(today);
            endDate.setDate(endDate.getDate() + days);

            return {
                days,
                startDate: today,
                endDate,
                membershipType: membershipData.type
            };
        } catch (error) {
            console.error('[MembershipHelpers] Error getting date range:', error);
            // Default to normal user (15 days) on error
            const today = new Date();
            const endDate = new Date(today);
            endDate.setDate(endDate.getDate() + 15);
            return { days: 15, startDate: today, endDate, membershipType: 0 };
        }
    };

    /**
     * Check if user can create an open match
     * @param {number} userId - User ID
     * @param {number} clubId - Club/Terrain ID
     * @returns {Promise<{canCreate: boolean, membershipType: number, reason: string}>}
     */
    const canCreateOpenMatch = async (userId, clubId) => {
        try {
            const membershipData = await membershipService.checkMembershipExpiry(userId, clubId);

            return {
                canCreate: membershipData.rules.canCreateOpenMatch,
                membershipType: membershipData.type,
                reason: membershipData.rules.canCreateOpenMatch
                    ? 'Allowed'
                    : 'Normal membership cannot create open matches'
            };
        } catch (error) {
            console.error('[MembershipHelpers] Error checking open match permission:', error);
            return {
                canCreate: false,
                membershipType: 0,
                reason: 'Error checking membership'
            };
        }
    };

    /**
     * Validate cancellation timing based on membership rules
     * @param {number} userId - User ID
     * @param {number} clubId - Club/Terrain ID
     * @param {Date} matchDate - Date of the match
     * @param {string} matchTime - Time of the match (HH:mm)
     * @returns {Promise<{canCancel: boolean, hoursRequired: number, hoursRemaining: number, reason: string}>}
     */
    const validateCancellationTiming = async (userId, clubId, matchDate, matchTime = '00:00') => {
        try {
            const membershipData = await membershipService.checkMembershipExpiry(userId, clubId);
            const requiredHours = membershipData.rules.cancellationHours;

            // Parse match date and time
            const [hours, minutes] = matchTime.split(':').map(Number);
            const matchDateTime = new Date(matchDate);
            matchDateTime.setHours(hours || 0, minutes || 0, 0, 0);

            // Calculate hours until match
            const now = new Date();
            const hoursUntilMatch = (matchDateTime - now) / (1000 * 60 * 60);

            const canCancel = hoursUntilMatch >= requiredHours;

            return {
                canCancel,
                hoursRequired: requiredHours,
                hoursRemaining: Math.max(0, hoursUntilMatch),
                membershipType: membershipData.type,
                reason: canCancel
                    ? 'Cancellation allowed'
                    : `Must cancel at least ${requiredHours} hours before the match`
            };
        } catch (error) {
            console.error('[MembershipHelpers] Error validating cancellation timing:', error);
            return {
                canCancel: false,
                hoursRequired: 48,
                hoursRemaining: 0,
                membershipType: 0,
                reason: 'Error checking membership'
            };
        }
    };

    /**
     * Apply membership pricing to a reservation
     * @param {number} userId - User ID
     * @param {number} clubId - Club/Terrain ID
     * @param {number} originalPrice - Original price before membership discount
     * @returns {Promise<{finalPrice: number, discount: number, originalPrice: number, membershipType: number, isFree: boolean}>}
     */
    const applyMembershipPricing = async (userId, clubId, originalPrice) => {
        try {
            const membershipData = await membershipService.checkMembershipExpiry(userId, clubId);
            const rules = membershipData.rules;

            let finalPrice = originalPrice;
            let discount = 0;

            if (rules.isFree) {
                // Infinity membership: FREE
                finalPrice = 0;
                discount = originalPrice;
            } else if (rules.priceDiscount > 0) {
                // Gold/Platinum: Apply discount
                discount = rules.priceDiscount;
                finalPrice = Math.max(0, originalPrice - discount);
            }

            return {
                finalPrice,
                discount,
                originalPrice,
                membershipType: membershipData.type,
                isFree: rules.isFree,
                membershipName: rules.name
            };
        } catch (error) {
            console.error('[MembershipHelpers] Error applying pricing:', error);
            return {
                finalPrice: originalPrice,
                discount: 0,
                originalPrice,
                membershipType: 0,
                isFree: false,
                membershipName: 'Normal'
            };
        }
    };

    return {
        getAvailableDateRange,
        canCreateOpenMatch,
        validateCancellationTiming,
        applyMembershipPricing
    };
}
