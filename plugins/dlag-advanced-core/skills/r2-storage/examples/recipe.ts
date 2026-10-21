// src/lib/server/private-files.ts. Dependencies must already be installed/approved.
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// Call only with an owner-authorized database row, never request JSON.
type AuthorizedReadyAsset = { objectKey: string; state: 'ready' };
export async function signReadyDownload(client: S3Client, bucket: string,
  asset: AuthorizedReadyAsset, approvedExpirySeconds: number) {
  if (asset.state !== 'ready') throw new Error('File unavailable');
  if (!Number.isInteger(approvedExpirySeconds) || approvedExpirySeconds < 1 || approvedExpirySeconds > 300)
    throw new Error('Invalid download expiry');
  return getSignedUrl(client, new GetObjectCommand({
    Bucket: bucket, Key: asset.objectKey,
    ResponseContentDisposition: 'attachment; filename="download"',
    ResponseCacheControl: 'private, no-store'
  }), { expiresIn: approvedExpirySeconds });
}
// Construct S3Client server-side with fixed R2 endpoint, region: 'auto', credentials.
// Route: verify principal -> owner-scoped ready asset lookup -> sign -> no-store response.
// The 300-second ceiling is a conservative example bound, not a provider lifetime claim.
