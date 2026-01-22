/**
 * ════════════════════════════════════════════════════════════════════════════════
 * MEMBERSHIP SERVICE - Business logic for membership operations
 * ════════════════════════════════════════════════════════════════════════════════
 */

export default function MembershipService(models) {
    const { membership, utilisateur } = models;

    /**
     * Membership rules definition for each type
     */
    const MEMBERSHIP_RULES = {
        0: { // Normal
            name: 'Normal',
            dateRangeDays: 15,
            priceDiscount: 0,
            canCreateOpenMatch: false,
            canJoinOpenMatch: true,
            canCreatePrivateMatch: true,
            canJoinPrivateMatch: true,
            cancellationHours: 48,
            isFree: false
        },
        1: { // Access
            name: 'Access',
            dateRangeDays: 14,
            priceDiscount: 0,
            canCreateOpenMatch: true,
            canJoinOpenMatch: true,
            canCreatePrivateMatch: true,
            canJoinPrivateMatch: true,
            cancellationHours: 24,
            isFree: false
        },
        2: { // Gold
            name: 'Gold',
            dateRangeDays: 21,
            priceDiscount: 300,
            canCreateOpenMatch: true,
            canJoinOpenMatch: true,
            canCreatePrivateMatch: true,
            canJoinPrivateMatch: true,
            cancellationHours: 24,
            isFree: false
        },
        3: { // Platinum
            name: 'Platinum',
            dateRangeDays: 28,
            priceDiscount: 300,
            canCreateOpenMatch: true,
            canJoinOpenMatch: true,
            canCreatePrivateMatch: true,
            canJoinPrivateMatch: true,
            cancellationHours: 12,
            isFree: false
        },
        4: { // Infinity
            name: 'Infinity',
            dateRangeDays: 28,
            priceDiscount: 0,
            canCreateOpenMatch: true,
            canJoinOpenMatch: true,
            canCreatePrivateMatch: true,
            canJoinPrivateMatch: true,
            cancellationHours: 24,
            isFree: true
        }
    };

    /**
     * Get membership rules for a specific type
     */
    const getMembershipRules = (membershipType) => {
        const type = parseInt(membershipType);
        if (!MEMBERSHIP_RULES[type]) {
            throw new Error(`Invalid membership type: ${membershipType}`);
        }
        return MEMBERSHIP_RULES[type];
    };

    /**
     * Get active membership for a user and club
     * Returns the membership if valid (not expired), null otherwise
     */
    const getMembershipByUser = async (userId, clubId) => {
        try {
            const userMembership = await membership.findOne({
                where: {
                    id_user: userId,
                    id_club: clubId
                },
                order: [['dateend', 'DESC']] // Get the most recent one
            });

            if (!userMembership) {
                return null;
            }

            // Check if expired
            const now = new Date();
            const endDate = new Date(userMembership.dateend);

            if (endDate < now) {
                console.log(`[MembershipService] Membership expired for user ${userId}, club ${clubId}`);
                return null;
            }

            return userMembership;
        } catch (error) {
            console.error('[MembershipService] Error getting membership:', error);
            throw error;
        }
    };

    /**
     * Check if user has already used their daily benefit (free match)
     * Returns true if they have already played/joined a match today using the benefit.
     */
    const hasUsedDailyLimitedBenefit = async (userId, dateStr) => {
        try {
            // Normalize date to string YYYY-MM-DD
            const checkDate = dateStr instanceof Date
                ? dateStr.toISOString().split('T')[0]
                : dateStr;

            // Find all reservations for this user on this date
            // We need to check both created reservations and participations
            // Actually, simpler: Check all participations for this user on this date
            // where statepaiement was handled as 'free' benefit.

            // The issue is, how do we know if a past match was 'free' due to membership?
            // If type=4 (Infinity), they pay 0.
            // But if they played multiple times, the first one was 0, others should be paid.
            // So we simply count how many matches they are in for this date.
            // If count >= 1, they have used the benefit.

            // Query: Get all participations for this user linked to reservations on checkDate
            const { reservation, participant, Op } = models;

            const participations = await participant.findAll({
                where: {
                    id_utilisateur: userId
                },
                include: [{
                    model: reservation,
                    as: 'reservation',
                    where: {
                        date: checkDate,
                        // Exclude cancelled matches if we want to allow re-use after cancel
                        isCancel: 0
                    }
                }]
            });

            // If they are in at least one valid match, they used their daily "free" slot (or paid slot, but benefit is 1/day).
            // Rules say: "can't use that membership more then 1 time".
            // If they already have a match, the next one is not covered.
            return participations.length > 0;

        } catch (error) {
            console.error('[MembershipService] Error checking daily usage:', error);
            return true; // Fail safe: assume used to prevent abuse if error
        }
    };

    /**
     * Check membership expiry and return effective membership type
     * If expired or doesn't exist, returns 0 (normal)
     * NEW: If type 4 (Infinity) and daily limit reached, downgrades to 0.
     */
    const checkMembershipExpiry = async (userId, clubId, dateContext = null) => {
        try {
            console.log(`[MembershipService] Checking membership for user ${userId}, club ${clubId}`);
            const userMembership = await getMembershipByUser(userId, clubId);

            if (!userMembership) {
                console.log(`[MembershipService] No membership found for user ${userId}`);
                return {
                    isValid: false,
                    type: 0,
                    rules: MEMBERSHIP_RULES[0],
                    membership: null
                };
            }

            const type = parseInt(userMembership.typemmbership);
            const now = new Date();
            const endDate = new Date(userMembership.dateend);

            if (endDate < now) {
                return {
                    isValid: false,
                    type: 0,
                    rules: MEMBERSHIP_RULES[0],
                    membership: null
                };
            }

            // Daily Limit Check for Infinity (Type 4)
            if (type === 4) {
                // Use dateContext if provided (for specific day check), otherwise checks today (now)
                const dateToCheck = dateContext || now;
                const limitReached = await hasUsedDailyLimitedBenefit(userId, dateToCheck);

                if (limitReached) {
                    // Downgrade effective status for pricing purposes (controller handles logic)
                    return {
                        isValid: true,
                        type: 4,
                        limitReached: true,
                        rules: MEMBERSHIP_RULES[4],
                        effectiveRules: MEMBERSHIP_RULES[0], // Treat as normal for pricing
                        membership: userMembership
                    };
                }
            }

            return {
                isValid: true,
                type: type,
                limitReached: false,
                rules: MEMBERSHIP_RULES[type],
                membership: userMembership
            };

        } catch (error) {
            console.error('[MembershipService] Error checking expiry:', error);
            throw error;
        }
    };

    /**
     * Purchase a membership
     * Deducts credits and creates/updates membership
     */
    const purchaseMembership = async (userId, type, paymentMethod) => {
        try {
            console.log(`[MembershipService] Processing purchase: User ${userId}, Type ${type}, Method ${paymentMethod}`);

            // Define Prices (Server-side validation)
            const PRICES = {
                1: 10000, // Access
                2: 30000, // Gold
                3: 35000, // Platinum
                4: 320000 // Infinity
            };

            const price = PRICES[type];
            if (!price) {
                throw new Error('Invalid membership type for purchase');
            }

            // JOIN TRANSACTION to prevent race conditions or partial updates (money lost)
            const t = await models.sequelize.transaction();

            try {
                // 1. Handle Credit Payment
                if (paymentMethod === 1) {
                    // Lock user row for update
                    const user = await utilisateur.findByPk(userId, { transaction: t, lock: true });

                    if (!user) {
                        throw new Error('User not found');
                    }

                    // Check Balance (Safe parsing)
                    let currentBalance = parseFloat(user.credit_balance || 0);

                    // Fallback to credit_gold_padel if needed (legacy compatibility)
                    if ((currentBalance === 0 || isNaN(currentBalance)) && user.credit_gold_padel) {
                        currentBalance = parseFloat(user.credit_gold_padel);
                    }
                    if (isNaN(currentBalance)) currentBalance = 0;

                    if (currentBalance < price) {
                        console.warn(`[MembershipService] Insufficient funds: Balance ${currentBalance} < Price ${price}`);
                        throw new Error('Insufficient credit balance');
                    }

                    // Deduct Credit
                    const newBalance = currentBalance - price;
                    console.log(`[MembershipService] Deducting funds. Old: ${currentBalance}, New: ${newBalance}`);

                    // Update user balance
                    const updateData = {};
                    // If credit_balance is the primary field used (value > 0 OR explicitly 0 but preferred field), update it.
                    // Otherwise update credit_gold_padel.
                    if ((parseFloat(user.credit_balance || 0) > 0) || (user.credit_balance === 0 && !user.credit_gold_padel)) {
                        updateData.credit_balance = newBalance;
                    } else {
                        updateData.credit_gold_padel = newBalance;
                    }

                    await user.update(updateData, { transaction: t });
                }

                // 2. Create/Update Membership (inside transaction)
                const rules = getMembershipRules(type);
                const days = rules.dateRangeDays;
                const now = new Date();
                const endDate = new Date();
                endDate.setDate(now.getDate() + days);

                // Use upsert to handle create/update atomically
                // This prevents duplicate key errors
                // CRITICAL: Must specify conflictFields to use the correct unique constraint
                const [resultMembership, created] = await membership.upsert({
                    id_user: parseInt(userId),
                    id_club: 1, // Default club
                    typemmbership: parseInt(type),
                    dateend: endDate.toISOString().split('T')[0], // YYYY-MM-DD
                    updated_at: now
                }, {
                    transaction: t,
                    returning: true,
                    conflictFields: ['id_user', 'id_club'] // Use the unique constraint, not primary key
                });

                console.log(`[MembershipService] Membership ${created ? 'created' : 'updated'} for user ${userId}`);

                // Commit transaction if all good
                await t.commit();

                return {
                    success: true,
                    membership: resultMembership,
                    message: 'Membership purchased successfully'
                };

            } catch (txError) {
                // Rollback transaction on any error
                await t.rollback();
                console.error('[MembershipService] Purchase Transaction Failed (Rolled Back):', txError);
                throw txError;
            }

        } catch (error) {
            console.error('[MembershipService] Purchase error NAME:', error.name);
            console.error('[MembershipService] Purchase error FULL:', JSON.stringify(error, null, 2));
            throw error;
        }
    };

    /**
     * Create a new membership
     */
    const createMembership = async (data) => {
        try {
            const { id_user, id_club, dateend, typemmbership } = data;

            // Validate membership type
            if (typemmbership < 0 || typemmbership > 4) {
                throw new Error('Invalid membership type. Must be between 0 and 4.');
            }

            // Create membership
            const newMembership = await membership.create({
                id_user,
                id_club: id_club || 1,
                dateend,
                typemmbership
            });

            console.log(`[MembershipService] Created membership ${newMembership.id} for user ${id_user}`);
            return newMembership;
        } catch (error) {
            console.error('[MembershipService] Error creating membership:', error);
            throw error;
        }
    };

    /**
     * Update an existing membership
     */
    const updateMembership = async (id, data) => {
        try {
            const existingMembership = await membership.findByPk(id);
            if (!existingMembership) {
                throw new Error('Membership not found');
            }

            // Validate membership type if being updated
            if (data.typemmbership !== undefined) {
                if (data.typemmbership < 0 || data.typemmbership > 4) {
                    throw new Error('Invalid membership type. Must be between 0 and 4.');
                }
            }

            await existingMembership.update(data);
            console.log(`[MembershipService] Updated membership ${id}`);
            return existingMembership;
        } catch (error) {
            console.error('[MembershipService] Error updating membership:', error);
            throw error;
        }
    };

    /**
     * Delete a membership
     */
    const deleteMembership = async (id) => {
        try {
            const existingMembership = await membership.findByPk(id);
            if (!existingMembership) {
                throw new Error('Membership not found');
            }

            await existingMembership.destroy();
            console.log(`[MembershipService] Deleted membership ${id}`);
            return { message: 'Membership deleted successfully' };
        } catch (error) {
            console.error('[MembershipService] Error deleting membership:', error);
            throw error;
        }
    };

    /**
     * Get membership by ID
     */
    const getMembershipById = async (id) => {
        try {
            const membershipData = await membership.findByPk(id);
            if (!membershipData) {
                throw new Error('Membership not found');
            }
            return membershipData;
        } catch (error) {
            console.error('[MembershipService] Error getting membership by ID:', error);
            throw error;
        }
    };

    /**
     * Get all memberships for a user
     */
    const getAllUserMemberships = async (userId) => {
        try {
            const memberships = await membership.findAll({
                where: { id_user: userId },
                order: [['dateend', 'DESC']]
            });
            return memberships;
        } catch (error) {
            console.error('[MembershipService] Error getting user memberships:', error);
            throw error;
        }
    };

    return {
        models,  // Expose models for debug endpoint
        getMembershipRules,
        getMembershipByUser,
        checkMembershipExpiry,
        createMembership,
        updateMembership,
        deleteMembership,
        getMembershipById,
        getAllUserMemberships,
        getDailyUsageStatus: async (userId, date) => {
            const res = await checkMembershipExpiry(userId, 1, date);
            return { limitReached: res.limitReached || false };
        },
        purchaseMembership
    };
}
