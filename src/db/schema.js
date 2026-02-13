import {
    pgTable,
    pgEnum,
    serial,
    varchar,
    integer,
    timestamp,
    jsonb,
    text,
} from 'drizzle-orm/pg-core';

/**
 * ENUM: match_status
 * Represents lifecycle of a match
 */
export const matchStatusEnum = pgEnum('match_status', [
    'scheduled',
    'live',
    'finished',
]);

/**
 * TABLE: matches
 */
export const matches = pgTable('matches', {
    id: serial('id').primaryKey(),

    sport: varchar('sport', { length: 100 }).notNull(),

    homeTeam: varchar('home_team', { length: 150 }).notNull(),
    awayTeam: varchar('away_team', { length: 150 }).notNull(),

    status: matchStatusEnum('status')
        .notNull()
        .default('scheduled'),

    startTime: timestamp('start_time', { withTimezone: true }),
    endTime: timestamp('end_time', { withTimezone: true }),

    homeScore: integer('home_score')
        .notNull()
        .default(0),

    awayScore: integer('away_score')
        .notNull()
        .default(0),

    createdAt: timestamp('created_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
});

/**
 * TABLE: commentary
 *
 * Designed for:
 * - High write throughput (live updates)
 * - Ordered events
 * - Flexible metadata storage
 */
export const commentary = pgTable('commentary', {
    id: serial('id').primaryKey(),

    matchId: integer('match_id')
        .notNull()
        .references(() => matches.id, { onDelete: 'cascade' }),

    minute: integer('minute'),

    /**
     * sequence:
     * Used to guarantee strict ordering
     * Example: 1, 2, 3, 4 for each event
     */
    sequence: integer('sequence').notNull(),

    /**
     * period:
     * e.g. "1H", "2H", "OT", "Q1", "Q2"
     */
    period: varchar('period', { length: 20 }),

    /**
     * eventType:
     * goal, foul, substitution, timeout, etc.
     */
    eventType: varchar('event_type', { length: 100 }),

    actor: varchar('actor', { length: 150 }),

    team: varchar('team', { length: 150 }),

    message: text('message').notNull(),

    /**
     * metadata:
     * Flexible JSONB field
     * Example:
     * {
     *   playerId: 12,
     *   assistBy: 9,
     *   xg: 0.43
     * }
     */
    metadata: jsonb('metadata'),

    /**
     * tags:
     * Optional categorization
     * Example: ["goal", "highlight"]
     */
    tags: jsonb('tags'),

    createdAt: timestamp('created_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
});


