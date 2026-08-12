import {
  bigint,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

import { entries } from './entries'

export const mediaStatus = pgEnum('media_status', [
  'processing',
  'ready',
  'failed',
])

export const media = pgTable(
  'media',
  {
    id: uuid('id').primaryKey(),
    ownerId: text('owner_id').notNull(),
    entryId: uuid('entry_id')
      .notNull()
      .references(() => entries.id, { onDelete: 'cascade' }),
    status: mediaStatus('status').default('processing').notNull(),
    originalName: text('original_name').notNull(),
    originalMime: text('original_mime').notNull(),
    originalSize: bigint('original_size', { mode: 'number' }).notNull(),
    width: integer('width').notNull(),
    height: integer('height').notNull(),
    originalKey: text('original_key').notNull(),
    displayKey: text('display_key').notNull(),
    thumbKey: text('thumb_key').notNull(),
    checksum: text('checksum').notNull(),
    detachedAt: timestamp('detached_at', {
      withTimezone: true,
      mode: 'date',
    }),
    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'date',
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('media_entry_created_at_idx').on(
      table.entryId,
      table.createdAt,
    ),
    index('media_detached_at_idx').on(table.detachedAt),
  ],
)

export type Media = typeof media.$inferSelect
export type NewMedia = typeof media.$inferInsert
