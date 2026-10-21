// SvelteKit 2: src/lib/server/identity.ts. Inspect the installed @workos-inc/node types first.
import { WorkOS } from '@workos-inc/node';
import { env } from '$env/dynamic/private';
export type Principal = Readonly<{ userId: string; organizationId?: string }>;
export async function principalFromSealedCookie(cookie: string | undefined): Promise<Principal | null> {
  if (!cookie) return null;
  if (!env.WORKOS_API_KEY || !env.WORKOS_CLIENT_ID || !env.WORKOS_COOKIE_PASSWORD || !env.WORKOS_ISSUER)
    throw new Error('Authentication configuration is missing');
  const workos = new WorkOS(env.WORKOS_API_KEY, { clientId: env.WORKOS_CLIENT_ID, issuer: env.WORKOS_ISSUER });
  const session = await workos.userManagement.loadSealedSession({
    sessionData: cookie, cookiePassword: env.WORKOS_COOKIE_PASSWORD
  });
  const result = await session.authenticate();
  if (!result.authenticated) return null;
  // Deliberately project fields. Never spread result: it may include accessToken.
  return { userId: result.user.id, organizationId: result.organizationId };
}
// hooks.server.ts calls this per request and assigns locals.principal.
// Declare App.Locals.principal as Principal | null in src/app.d.ts.
// Unexpected SDK failures become a safe 5xx, never a fabricated signed-in user.
