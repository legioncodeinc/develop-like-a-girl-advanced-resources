# Wire WorkOS login to SvelteKit

This worked recipe targets SvelteKit 2 and the installed official WorkOS Node SDK with PKCE and sealed-session helpers. Match SDK types before applying; older SDKs may lack `getAuthorizationUrlWithPKCE`, `issuer`, or retryable refresh results. Request an approved dependency update rather than removing the state or token validation boundary. For SvelteKit 3 adapt aliases/environment imports using the [Vercel version guide](../../vercel-platform/guides/deploy-and-operate.md).

The flow uses a fixed `/app` landing route. Add return destinations only through an exact server allowlist. WorkOS handles customer login; Payload editors keep Payload login.

## Private configuration

```ts
// src/lib/server/workos.ts
import { WorkOS } from '@workos-inc/node';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
function required(name: string): string {
  const value = env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}
export const clientId = required('WORKOS_CLIENT_ID');
export const cookiePassword = required('WORKOS_COOKIE_PASSWORD');
if (cookiePassword.length < 32) throw new Error('WORKOS_COOKIE_PASSWORD must be at least 32 characters');
export const appOrigin = new URL(required('APP_ORIGIN')).origin;
if (!dev && !appOrigin.startsWith('https://')) throw new Error('APP_ORIGIN must use HTTPS');
// Configure the exact expected issuer for this WorkOS environment/custom domain.
export const workos = new WorkOS(required('WORKOS_API_KEY'), {
  clientId, issuer: required('WORKOS_ISSUER')
});
export const cookieOptions = {
  path: '/', httpOnly: true, secure: !dev, sameSite: 'lax' as const
};
export const sessionName = dev ? 'app-session' : '__Host-app-session';
export const stateName = dev ? 'auth-state' : '__Host-auth-state';
export const verifierName = dev ? 'auth-verifier' : '__Host-auth-verifier';
export const sessionMaxAge = 60 * 60 * 24; // Project cookie cap, never extends provider validity.
export type Principal = Readonly<{
  userId: string; organizationId?: string; sessionId: string;
}>;
```

`APP_ORIGIN` is a server-selected exact origin. Confirm issuer from the environment's documented token issuer, not browser input or an arbitrary decoded JWT. Do not copy an example issuer across custom domains. Keep the cookie password stable across instances; rotation invalidates or requires coordinated resealing of sessions.

## Start and complete sign-in

```ts
// src/routes/auth/login/+server.ts
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { workos, clientId, appOrigin, cookieOptions, stateName, verifierName } from '$lib/server/workos';
export const GET: RequestHandler = async ({ cookies }) => {
  const { url, state, codeVerifier } = await workos.userManagement.getAuthorizationUrlWithPKCE({
    provider: 'authkit', clientId, redirectUri: `${appOrigin}/auth/callback`
  });
  cookies.set(stateName, state, { ...cookieOptions, maxAge: 600 });
  cookies.set(verifierName, codeVerifier, { ...cookieOptions, maxAge: 600 });
  redirect(303, url);
};
```

```ts
// src/routes/auth/callback/+server.ts
import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
  workos, clientId, cookiePassword, cookieOptions, sessionMaxAge,
  stateName, verifierName, sessionName
} from '$lib/server/workos';
export const GET: RequestHandler = async ({ url, cookies }) => {
  const expected = cookies.get(stateName);
  const codeVerifier = cookies.get(verifierName);
  cookies.delete(stateName, { path: '/' });
  cookies.delete(verifierName, { path: '/' });
  const state = url.searchParams.get('state');
  const code = url.searchParams.get('code');
  if (!expected || !codeVerifier || !state || state !== expected || !code || code.length > 4096) {
    error(400, 'Sign-in could not be completed. Start again.');
  }
  let sealed: string | undefined;
  try {
    const result = await workos.userManagement.authenticateWithCode({
      clientId, code, codeVerifier, session: { sealSession: true, cookiePassword }
    });
    sealed = result.sealedSession;
  } catch {
    // Never log codes, tokens or SDK response bodies. Restart login after a failed exchange.
    error(503, 'Sign-in is temporarily unavailable. Start again.');
  }
  if (!sealed) error(503, 'Sign-in is temporarily unavailable.');
  cookies.set(sessionName, sealed, { ...cookieOptions, maxAge: sessionMaxAge });
  redirect(303, '/app');
};
```

The PKCE helper generates and returns its own state; store that returned value, not an independently generated state that the helper does not accept. A second login tab replaces the first short-lived flow. That is intentional for this small recipe; a product needing simultaneous flows should store bounded flow records keyed by a random ID. Authentication codes are single-use. No callback response or server log should include them.

## Request-local authentication and refresh

```ts
// src/hooks.server.ts. Compose with existing hooks rather than replacing them.
import type { Handle } from '@sveltejs/kit';
import { workos, cookiePassword, cookieOptions, sessionName, sessionMaxAge } from '$lib/server/workos';
export const handle: Handle = async ({ event, resolve }) => {
  event.locals.principal = null;
  const cookie = event.cookies.get(sessionName);
  if (cookie) {
    const session = workos.userManagement.loadSealedSession({ sessionData: cookie, cookiePassword });
    const authenticated = await session.authenticate();
    if (authenticated.authenticated) {
      event.locals.principal = {
        userId: authenticated.user.id, organizationId: authenticated.organizationId,
        sessionId: authenticated.sessionId
      };
    } else {
      const refreshed = await session.refresh();
      if (refreshed.authenticated && refreshed.sealedSession) {
        event.cookies.set(sessionName, refreshed.sealedSession, { ...cookieOptions, maxAge: sessionMaxAge });
        event.locals.principal = {
          userId: refreshed.user.id, organizationId: refreshed.organizationId,
          sessionId: refreshed.sessionId
        };
      } else if (!refreshed.authenticated && refreshed.retryable) {
        // Retain the cookie for a later retry; do not treat an expired JWT as authorized.
        return new Response('Sign-in is temporarily unavailable.', {
          status: 503, headers: { 'cache-control': 'private, no-store', 'retry-after': '5' }
        });
      } else {
        event.cookies.delete(sessionName, { path: '/' });
      }
    }
  }
  const response = await resolve(event);
  if (cookie || event.locals.principal || event.url.pathname.startsWith('/auth/')) {
    const headers = new Headers(response.headers);
    headers.set('cache-control', 'private, no-store');
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }
  return response;
};
```

Unknown SDK or JWKS failures must reach the safe application error handler; never fabricate a user. Observe provider refresh retry guidance and avoid immediate retry loops. Token validation does not imply instantaneous revocation. Use fresh membership/permission checks for sensitive operations, and document the accepted revocation delay.

```ts
// src/app.d.ts: merge into existing declarations.
import type { Principal } from '$lib/server/workos';
declare global {
  namespace App { interface Locals { principal: Principal | null } }
}
export {};
```

```ts
// src/routes/auth/logout/+server.ts
import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { workos, appOrigin, sessionName } from '$lib/server/workos';
export const POST: RequestHandler = async ({ request, locals, cookies }) => {
  if (request.headers.get('origin') !== appOrigin) error(403, 'Request refused');
  const sessionId = locals.principal?.sessionId;
  cookies.delete(sessionName, { path: '/' });
  locals.principal = null;
  if (!sessionId) redirect(303, '/');
  const url = workos.userManagement.getLogoutUrl({ sessionId, returnTo: appOrigin });
  redirect(303, url);
};
```

Use `<form method="POST" action="/auth/logout"><button>Sign out</button></form>`. Register the exact sign-in callback and sign-out URI through the approved provider setup. Secure cookies require HTTPS outside local development.

## Authorization wiring and checks

Each protected server load, action and endpoint checks `locals.principal` itself. A parent layout check alone does not cover independent requests. Pass only `userId` and verified organization context into data functions. Resolve active membership and required permission before organization reads/writes. Do not return `sessionId`, sealed cookies or tokens from page data.

Check missing/mismatched state, replayed callback, denied consent, missing cookie, expired session with successful refresh, retryable refresh retaining cookie but denying access, terminal refresh clearing cookie, cross-origin logout, and cross-owner API requests. Run existing project checks after wiring. Provider OAuth and refresh evidence remains separate from local stubs.

Sources checked 2026-10-21: [official Node SDK PKCE](https://github.com/workos/workos-node#pkce-with-confidential-clients), [session helper implementation](https://github.com/workos/workos-node/blob/main/src/user-management/session.ts), [session lifecycle](https://workos.com/docs/authkit/sessions), [session resilience](https://workos.com/docs/authkit/session-resilience).
