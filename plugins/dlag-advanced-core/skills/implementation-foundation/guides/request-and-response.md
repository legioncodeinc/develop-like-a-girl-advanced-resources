# Implement a bounded SvelteKit request

Begin with the application contract: verified actor, permitted fields, maximum input bytes, output projection, duplicate behavior and error result. Native forms are the baseline for user edits. A JSON endpoint is appropriate for a requested API client, not necessary merely to submit a form.

## Bound JSON before parsing

This helper is an integration recipe for a server-only module. It limits actual streamed bytes, not a client-supplied Content-Length. Keep the deployment/request timeout configured separately; a byte cap does not stop a stalled client.

```ts
export async function readSmallJson(request: Request, maxBytes = 8192): Promise<unknown> {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1 || maxBytes > 65536)
    throw new RangeError('Invalid body limit');
  const contentType = request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
  if (contentType !== 'application/json') throw new TypeError('Expected application/json');
  if (!request.body) throw new SyntaxError('Missing body');
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new RangeError('Request body too large');
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  return JSON.parse(text) as unknown;
}
```

Then validate shape and exact fields with the installed schema validator or an explicit small guard. A successful JSON parse can still produce null, a number, a nested object or an overlong string. A form parser likewise needs actual-byte limits before `formData()`, rejects unexpected keys and checks `getAll(name).length === 1` for scalar fields. File values must not be coerced with `String()`.

For a cookie-authenticated JSON mutation, verify an exact allowed Origin before the operation; do not silently allow a missing Origin as a browser request. Non-browser API credentials need their own explicit policy. Keep SvelteKit's built-in form-origin check enabled. WorkOS identity and Data Foundation enforce ownership independently of CSRF checks.

## Translate errors at the correct boundary

| Condition | Result |
| --- | --- |
| Invalid JSON or malformed field shape | 400 with safe message |
| Wrong body format | 415 |
| Body beyond contract | 413 |
| Valid form with field errors | Action `fail(422, { values, errors })` |
| Missing API authentication | 401 with the applicable authentication challenge, or the documented cookie-session denial flow |
| Denied access | 403 or concealed 404 |
| Already-existing conflicting record | 409 |
| Provider unavailable | Safe 502/503 as appropriate, with a retry policy |

Catch only around the parse or provider call being translated. Do not wrap a whole route in a catch that turns SvelteKit redirects or HTTP errors into 500. Logs contain a correlation ID and safe operation name, not request bodies, cookie headers or raw provider responses.

Finish the required database write before returning success. For an optional notification, follow the packaged transactional-mail outcome contract so a mail failure does not turn an already-saved record into an apparent unsaved form. Repeated consequential submissions require server-side deduplication.

## Type and runtime evidence

Use generated route types, strict TypeScript and explicit return models. Compile only affected source when authorized tooling exists. A syntax-only transpile cannot establish that generated route types, provider SDK calls or database schema imports exist. Document the integration prerequisites and let the consumer's application check prove them.

Sources: [SvelteKit form actions](https://svelte.dev/docs/kit/form-actions), [SvelteKit server-only modules](https://svelte.dev/docs/kit/server-only-modules), [MDN ReadableStream reader](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream/getReader).
