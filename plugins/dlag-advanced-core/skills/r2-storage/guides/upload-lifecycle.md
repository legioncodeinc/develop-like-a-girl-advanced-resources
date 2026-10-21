# Build the private file lifecycle

Use Neon for ownership/state and R2 for bytes. This guide supplies the missing upload, completion and recovery method around the existing signed-download helper. Keep website media publication separate from app file permissions.

## Data and endpoint contract

Draft this migration in the consuming app, adapting its owner table and existing ID style:

```sql
CREATE TABLE app_assets (
  id uuid PRIMARY KEY,
  owner_id text NOT NULL,
  upload_key text NOT NULL UNIQUE,
  final_key text UNIQUE,
  expected_size bigint NOT NULL CHECK (expected_size > 0),
  expected_type text NOT NULL,
  upload_expires_at timestamptz NOT NULL,
  state text NOT NULL DEFAULT 'pending'
    CHECK (state IN ('pending', 'checking', 'ready', 'rejected', 'deleting', 'deleted')),
  claim_id uuid,
  claim_expires_at timestamptz,
  actual_size bigint,
  checked_sha256 text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX app_assets_owner_created_idx ON app_assets(owner_id, created_at, id);
```

| Endpoint | Request | Server work | Response |
|---|---|---|---|
| POST `/api/files` | bounded name, size, allowlisted media type | Verify principal/origin, atomically reserve quota, create random asset ID and upload key, persist pending record | asset ID and accepted byte limit; no-store |
| PUT `/api/files/[id]/content` | raw bytes | Owner/origin lookup, conditional claim, count actual bytes up to the accepted limit before any R2 write, store quarantined bytes | uploaded/checking, no-store |
| POST `/api/files/[id]/complete` | asset ID only | Owner lookup, conditional state claim, freeze bytes, inspect, persist ready or rejected | ready/checking/rejected, no-store |
| GET `/api/files/[id]/download` | asset ID only | Owner + ready lookup, sign final key | short-lived URL, no-store |
| DELETE `/api/files/[id]` | asset ID only | Fresh authorization, durable deleting state, delete owned keys, record deleted | idempotent completion |

The default path sends a small raw body through the authenticated app endpoint. It issues no browser write URL. Reserve quota atomically before accepting a claim and count actual bytes before storage; browser MIME and Content-Length declarations are not evidence. Never overwrite a ready object. A recovery claim gets a new opaque upload key.

## Server client and bounded upload

```ts
// src/lib/server/storage.ts, SvelteKit 2 environment API.
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';
function required(name: string): string {
  const value = env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}
const endpoint = new URL(required('R2_ENDPOINT'));
if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password
  || endpoint.search || endpoint.hash || endpoint.pathname !== '/') {
  throw new Error('Invalid R2_ENDPOINT');
}
export const bucket = required('R2_BUCKET');
export const storage = new S3Client({
  region: 'auto', endpoint: endpoint.origin,
  credentials: {
    accessKeyId: required('R2_ACCESS_KEY_ID'),
    secretAccessKey: required('R2_SECRET_ACCESS_KEY')
  }
});
export const MAX_FILE_BYTES = 2 * 1024 * 1024; // App policy, below the host request ceiling.
export async function uploadClaimedSmallFile(request: Request, asset: {
  uploadKey: string; expectedType: string; expectedSize: number; state: string;
}) {
  // Caller already verified owner, exact origin, quota reservation and durable claim.
  if (asset.state !== 'checking') throw new Error('Upload unavailable');
  if (!Number.isSafeInteger(asset.expectedSize) || asset.expectedSize < 1
    || asset.expectedSize > MAX_FILE_BYTES) throw new Error('Invalid accepted size');
  if (request.headers.get('content-type') !== asset.expectedType) {
    throw Object.assign(new Error('Unexpected media type'), { status: 415 });
  }
  const reader = request.body?.getReader();
  if (!reader) throw Object.assign(new Error('Missing body'), { status: 400 });
  const chunks: Uint8Array[] = [];
  let size = 0;
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    void reader.cancel().catch(() => {});
  }, 10000);
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (timedOut) throw Object.assign(new Error('Upload timed out'), { status: 408 });
      if (done) break;
      size += value.byteLength;
      if (size > asset.expectedSize || size > MAX_FILE_BYTES) {
        await reader.cancel();
        throw Object.assign(new Error('File too large'), { status: 413 });
      }
      chunks.push(value);
    }
    if (size !== asset.expectedSize) {
      throw Object.assign(new Error('File size mismatch'), { status: 400 });
    }
  } finally {
    clearTimeout(timer);
    reader.releaseLock();
  }
  // Nothing is uploaded until the entire body has passed the actual-byte checks.
  const body = Buffer.concat(chunks, size);
  await storage.send(new PutObjectCommand({
    Bucket: bucket, Key: asset.uploadKey, ContentType: asset.expectedType,
    ContentLength: body.length, Body: body
  }), { abortSignal: AbortSignal.timeout(5000) });
  return { size }; // Remains quarantined until inspection and conditional ready commit.
}
```

The caller supplies an authorized, claimed database row, not request JSON. Only the operator-selected R2 account endpoint is permitted; validating URL syntax does not authorize a different host. Use the `R2_*` names rather than reserved Vercel `AWS_*` variables. Map the helper's safe status failures to the response; storage/network failures stay retryable and must not publish the record.

Vercel currently limits function request/response bodies to 4.5 MB. The illustrative 2 MiB raw-body cap leaves room below that ceiling; verify the actual deployment limit and choose a smaller app cap if needed. Do not accept multipart form overhead or arbitrarily large uploads through this route. The app must also bound concurrent uploads/rate and atomically reserve aggregate owner quota before reading; a per-file cap alone is not an aggregate quota. Conditional claims prevent simultaneous writes to the same upload key.

For files above the server path's safe cap, an ordinary presigned PUT does **not** enforce the application's accepted byte size before R2 stores it. Completion-time HEAD rejection cannot undo bandwidth or storage consumption. This baseline therefore does not issue direct PUT URLs for hard-cap enforcement. A separately selected large-file design must supply a verified pre-storage enforcement mechanism, or explicitly accept and bound direct-upload storage abuse exposure through its own policy. CORS, MIME signing, declared size, expiry and later deletion do not constitute a byte cap. No large-file infrastructure is selected by this recipe.

## Completion without overwrite races

After the bounded upload, freeze the quarantined object into a new server-only final candidate key before inspection, and publish only that key. This also preserves the publication boundary if a separately accepted direct-upload design is introduced later: a reusable PUT URL must never target the final key.

1. Before reading the upload body, atomically change `pending` to `checking`, assigning a random claim ID and a bounded lease. Complete storage and inspection under that same claim; do not re-claim a live request from a second completion endpoint. Other completions return checking. A recovery attempt uses a new claim, upload key and candidate key after an expired lease. Its quota reservation must account for abandoned bytes until reconciled.
2. HEAD the upload key. Require actual size equal to the accepted size, within the project cap, and compatible declared type. Persist a rejection on a permanent mismatch. Missing/transient storage failures remain retryable.
3. Copy the observed version into a new opaque key that has never been signed for PUT. Use the observed ETag as a copy precondition, so an intervening upload causes a retry instead of publishing different bytes.
4. Read and inspect the copied candidate bytes. Enforce a bounded stream cap; verify actual file format, decode/parse as appropriate, compute digest and run the selected scanner when required. HEAD or a matching MIME string alone is not inspection. Treat active HTML/SVG as downloads unless the product explicitly sanitizes/rasterizes them.
5. Commit ready with final key, size and digest only where owner, state and claim ID still match. A lost lease must not publish. Downloads use only that committed final key. Never return candidate keys to clients.

```ts
// Storage freeze primitive: parameters come from the owned, claimed row and HEAD.
import { CopyObjectCommand } from '@aws-sdk/client-s3';
import { storage, bucket } from './storage';
export async function freezeUpload(uploadKey: string, candidateKey: string, etag: string) {
  const source = `${bucket}/${uploadKey.split('/').map(encodeURIComponent).join('/')}`;
  await storage.send(new CopyObjectCommand({
    Bucket: bucket, Key: candidateKey, CopySource: source, CopySourceIfMatch: etag
  }));
}
```

The SDK/R2 conditional copy must be supported by the installed versions. If it is unavailable, use a server-controlled bounded read/validate/write into a new key; never drop the immutable-publication requirement. Do not publish a mutable upload key. Large multipart objects need an explicitly implemented completion/abort policy, not this single PUT recipe.

Recovery needs no new queue provider: an authorized user retry or operator command may resume an expired claim. Record abandoned candidate keys for an explicitly approved cleanup operation. Never automatically delete a ready object because a stale completion failed. Likewise, delete marks intent first, tolerates already-absent objects, and finishes the record after confirmed storage deletion.

## Acceptance evidence for a consuming app

Check cross-owner begin/upload/complete/download/delete; oversized actual stream is rejected before any R2 send, including false or absent Content-Length; aggregate quota/concurrent-claim refusal; wrong content; expired signing; concurrent completion; overwrite after completion cannot alter ready bytes; storage timeout leaves retryable state; lost lease cannot publish; no signed URLs in logs/cache. Public website media gets a separate explicit policy.

Sources checked 2026-10-21: [R2 AWS SDK examples](https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/), [presigned URL behavior](https://developers.cloudflare.com/r2/api/s3/presigned-urls/), [S3 compatibility](https://developers.cloudflare.com/r2/api/s3/api/), [CORS](https://developers.cloudflare.com/r2/buckets/cors/), [Vercel function body limits](https://vercel.com/docs/functions/limitations).
