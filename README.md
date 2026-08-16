# RAS.

RAS. (*Rien à signaler*) is a private, mobile-first personal journal built as a full-stack Next.js application. It combines rich-text writing, flexible photo layouts, autosave, a chronological timeline, and calendar-based archives in a calm editorial interface.

The project is designed for a single owner: public registration is disabled, journal entries are scoped to the authenticated user, and photos are stored outside the public application directory.

## Features

- Single-owner email and password authentication
- Rich-text entries with optimistic-concurrency autosave
- Private image upload, WebP processing, and responsive photo groups
- Chronological journal and calendar archives
- Installable mobile-first interface without offline data storage

## Stack

- Next.js 16, React 19, and TypeScript
- Tailwind CSS 4
- Tiptap 3
- PostgreSQL, Drizzle ORM, and Drizzle Kit
- Better Auth
- Sharp and Zod

## Deployment

Every push to `main` builds a Linux standalone artifact with GitHub Actions.
The artifact is uploaded for short-term retention and deployed automatically
to Alwaysdata through SSH. Runtime secrets and database configuration are
provided through GitHub Actions and Alwaysdata environment variables.

## Status

RAS. is an active work in progress. The core journal experience is implemented
and deployed, while automated tests, production hardening, and some product
details remain on the roadmap.
