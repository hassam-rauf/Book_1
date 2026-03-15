import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db/client.js';
import * as schema from './db/schema.js';

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },

  trustedOrigins: allowedOrigins,

  // after:signUp hook — insert user_profile row with custom fields from sign-up body
  hooks: {
    after: [
      {
        matcher: (context) => context.path === '/sign-up/email',
        handler: async (context) => {
          // @ts-expect-error — context.body is not typed in hook context
          const body = context.body as Record<string, unknown>;
          // @ts-expect-error — context.context.returned is the sign-up response
          const userId: string | undefined = (context.context.returned as { user?: { id: string } })?.user?.id;

          if (!userId) return;

          const VALID_EXPERIENCE = ['beginner', 'intermediate', 'advanced'] as const;
          const VALID_HARDWARE = ['laptop-only', 'gpu-workstation', 'jetson-kit', 'robot'] as const;
          const VALID_LANGUAGE = ['en', 'ur'] as const;

          const experienceLevel = VALID_EXPERIENCE.includes(body.experienceLevel as typeof VALID_EXPERIENCE[number])
            ? (body.experienceLevel as string)
            : 'beginner';

          const hardware = VALID_HARDWARE.includes(body.hardware as typeof VALID_HARDWARE[number])
            ? (body.hardware as string)
            : 'laptop-only';

          const preferredLanguage = VALID_LANGUAGE.includes(body.preferredLanguage as typeof VALID_LANGUAGE[number])
            ? (body.preferredLanguage as string)
            : 'en';

          const programmingBackground =
            typeof body.programmingBackground === 'string'
              ? body.programmingBackground.slice(0, 200)
              : '';

          try {
            await db.insert(schema.userProfile).values({
              userId,
              experienceLevel,
              programmingBackground,
              hardware,
              preferredLanguage,
              updatedAt: new Date(),
            });
          } catch (err) {
            // Log but do not block sign-up — profile can be completed later
            console.error('[auth] Failed to create user_profile for user', userId, err);
          }
        },
      },
    ],
  },
});
