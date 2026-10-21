// SvelteKit 2 svelte.config.js recipe; preserve the project's preprocessing configuration.
import adapter from '@sveltejs/adapter-vercel';
export default {
  kit: { adapter: adapter() }
};
// package.json: retain the selected supported Node major in engines.node.
// src/routes/(app)/+layout.server.ts may set prerender = false for private routes.
// Each protected leaf load/action/API still enforces its own permission check.
