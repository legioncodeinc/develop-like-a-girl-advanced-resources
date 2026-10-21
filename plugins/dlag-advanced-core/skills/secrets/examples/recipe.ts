// src/lib/server/private-config.ts, SvelteKit 2 recipe.
import { env } from '$env/dynamic/private';
export function requirePrivate(name: string): string {
  const value = env[name];
  if (!value) throw new Error(`Missing server configuration: ${name}`);
  return value;
}
export function databaseConfig() {
  return { url: requirePrivate('DATABASE_URL') };
}
// Server callers consume this object. Never return it from a load/action or log it.
