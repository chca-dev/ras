import {
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

export const entries = pgTable(
  'entries',
  {
    id: uuid('id').primaryKey(),
    ownerId: text('owner_id').notNull(),
    title: varchar('title', { length: 160 }),
    entryDate: date('entry_date', { mode: 'string' }).notNull(),
    content: jsonb('content').$type<Record<string, unknown>>().notNull(),
    plainText: text('plain_text').default('').notNull(),
    coverMediaId: uuid('cover_media_id'),
    revision: integer('revision').default(1).notNull(),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'date',
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'date',
    })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('entries_owner_entry_date_created_at_idx').on(
      table.ownerId,
      table.entryDate.desc(),
      table.createdAt.desc(),
    ),
    index('entries_owner_updated_at_idx').on(
      table.ownerId,
      table.updatedAt.desc(),
    ),
  ],
)

export type Entry = typeof entries.$inferSelect
export type NewEntry = typeof entries.$inferInsert
