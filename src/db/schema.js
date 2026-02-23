import {
    pgTable,
    pgEnum,
    serial,
    varchar,
    integer,
    timestamp,
    jsonb,
    text,
    uniqueIndex,
} from 'drizzle-orm/pg-core';

/**
 * ENUM: match_status
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
 */
export const commentary = pgTable(
    'commentary',
    {
        id: serial('id').primaryKey(),

        matchId: integer('match_id')
            .notNull()
            .references(() => matches.id, { onDelete: 'cascade' }),

        minute: integer('minute'),

        sequence: integer('sequence').notNull(),

        period: varchar('period', { length: 20 }),

        eventType: varchar('event_type', { length: 100 }),

        actor: varchar('actor', { length: 150 }),

        team: varchar('team', { length: 150 }),

        message: text('message').notNull(),

        metadata: jsonb('metadata'),

        tags: jsonb('tags'),

        createdAt: timestamp('created_at', { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    // (table) => ({
    //     /**
    //      * 🔒 Enforce strict ordering per match
    //      * Prevent duplicate sequence values inside same match
    //      */
    //     uniqueMatchSequence: uniqueIndex('commentary_match_sequence_unique')
    //         .on(table.matchId, table.sequence),
    // })
);
