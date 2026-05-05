# Level-Up Planner Auth Setup

## Recommendation

This MVP uses NextAuth.js with credentials login, optional Google OAuth, and Prisma/PostgreSQL.

Why NextAuth for this codebase:
- Prisma/Postgres already exists in the app.
- Passwords are stored as salted bcrypt hashes, never plain text.
- Google OAuth secrets stay server-side if Google login is enabled later.
- Sessions use HTTP-only cookies managed by NextAuth.
- User access level is checked on the server.

Supabase Auth is still a strong choice if you want hosted auth, file storage, realtime, and row-level security as the center of the product later.

## Packages

- `next-auth`
- `@next-auth/prisma-adapter`
- `bcryptjs`
- Existing: `@prisma/client`, `prisma`, `zod`

## Environment Variables

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/level_up_planner?schema=public"
NEXTAUTH_URL="https://your-vercel-domain.vercel.app"
NEXTAUTH_SECRET="replace-with-openssl-rand-base64-32"
# Optional, only needed if you want the extra Google OAuth button.
GOOGLE_CLIENT_ID="your-google-oauth-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
```

Generate a secret:

```bash
openssl rand -base64 32
```

Traditional username/password login works without Google credentials.

For local development, use your local Postgres URL and `http://127.0.0.1:3000` for `NEXTAUTH_URL`.

Optional Google OAuth redirect URI:

```text
http://127.0.0.1:3000/api/auth/callback/google
```

Production redirect URI should use your deployed domain:

```text
https://your-domain.com/api/auth/callback/google
```

## Database Setup

```bash
pnpm prisma:generate
pnpm prisma:migrate
```

For a production/shared database, run migrations with:

```bash
pnpm prisma:deploy
```

The migration creates:
- `users`
- `accounts`
- `sessions`
- `verification_tokens`
- `friendships`
- `conversations`
- `conversation_members`
- `messages`
- `coop_quests`
- `coop_quest_participants`
- `planner_states`

`planner_states` stores each user planner/calendar/settings state by `user_id`, so planner data can sync across devices when the app is connected to one shared database.

## Important Security Notes

- The app never stores Google passwords.
- The app never stores raw account passwords. It stores bcrypt hashes in `users.password_hash`.
- `GOOGLE_CLIENT_SECRET` is only read server-side.
- `access_level` is stored in the database and must only be changed from trusted server/admin code.
- Protected pages use middleware and server session checks.
- Profile avatar upload currently writes to `public/uploads/avatars` for local MVP development. On Vercel, this is not durable across deployments, so use durable object storage such as Supabase Storage, S3, or R2 before relying on avatars in production.
- All users must connect to the same deployed app and same shared database for friends, messages, notifications, co-op quests, and planner sync to work between devices.

## Key Files

```text
src/lib/auth.ts
src/lib/prisma.ts
src/lib/session.ts
src/types/next-auth.d.ts
middleware.ts
src/app/api/auth/[...nextauth]/route.ts
src/app/login/page.tsx
src/app/onboarding/page.tsx
src/app/dashboard/page.tsx
src/app/settings/page.tsx
src/app/social/page.tsx
src/app/api/profile/complete/route.ts
src/app/api/profile/avatar/route.ts
src/app/api/friends/search/route.ts
src/app/api/friends/request/route.ts
src/app/api/conversations/route.ts
src/app/api/messages/[conversationId]/route.ts
src/app/api/coop-quests/route.ts
```
- `users.password_hash` stores bcrypt password hashes for traditional accounts.
