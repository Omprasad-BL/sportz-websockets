import { z } from 'zod';

/**
 * MATCH_STATUS constant
 * Used to keep status values centralized and consistent
 */
export const MATCH_STATUS = {
    SCHEDULED: 'scheduled',
    LIVE: 'live',
    FINISHED: 'finished',
};

/**
 * Utility: ISO date validation
 */
const isValidIsoDate = (value) => {
    const date = new Date(value);
    return !Number.isNaN(date.getTime()) && value === date.toISOString();
};

/**
 * Query Schema: List Matches
 * Optional limit
 * - coerced to number
 * - must be positive
 * - max 100
 */
export const listMatchesQuerySchema = z.object({
    limit: z
        .coerce.number()
        .int()
        .positive()
        .max(100)
        .optional(),
});

/**
 * Route Param Schema: matchId
 */
export const matchIdParamSchema = z.object({
    id: z
        .coerce.number()
        .int()
        .positive(),
});

/**
 * Create Match Schema
 */
export const createMatchSchema = z
    .object({
        sport: z.string().trim().min(1, 'Sport is required'),
        homeTeam: z.string().trim().min(1, 'Home team is required'),
        awayTeam: z.string().trim().min(1, 'Away team is required'),

        startTime: z
            .string()
            .refine(isValidIsoDate, {
                message: 'startTime must be a valid ISO date string',
            }),

        endTime: z
            .string()
            .refine(isValidIsoDate, {
                message: 'endTime must be a valid ISO date string',
            }),

        homeScore: z
            .coerce.number()
            .int()
            .nonnegative()
            .optional(),

        awayScore: z
            .coerce.number()
            .int()
            .nonnegative()
            .optional(),
    })
    .superRefine((data, ctx) => {
        const start = new Date(data.startTime);
        const end = new Date(data.endTime);

        if (end <= start) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'endTime must be after startTime',
                path: ['endTime'],
            });
        }
    });

/**
 * Update Score Schema
 */
export const updateScoreSchema = z.object({
    homeScore: z
        .coerce.number()
        .int()
        .nonnegative(),

    awayScore: z
        .coerce.number()
        .int()
        .nonnegative(),
});
