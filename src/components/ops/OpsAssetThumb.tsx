'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Film, FileImage, Lock, X } from 'lucide-react';
import { extractDriveFileId } from '@/lib/ops/drop-parser';
import {
  clearGoogleDriveAccessToken,
  DRIVE_TOKEN_EVENT,
  getGoogleDriveAccessToken,
  getOpsAuth,
  signInOpsWithGoogle,
} from '@/lib/ops/firebase-client';
import type { JobAsset } from '@/lib/ops/types';

export function assetPlatformLabel(platform: JobAsset['platform']): string {
  if (platform === 'linkedin') return 'LI';
  if (platform === 'all') return 'ALL';
  return platform.toUpperCase();
}

export function assetStatusBadge(status: JobAsset['status']): { label: string; cls: string } {
  if (status === 'approved') {
    return {
      label: 'Approved',
      cls: 'border-emerald-500/45 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    };
  }
  if (status === 'rejected') {
    return {
      label: 'Rejected',
      cls: 'border-red-500/45 bg-red-500/15 text-red-700 dark:text-red-300',
    };
  }
  if (status === 'delivered') {
    return {
      label: 'Delivered',
      cls: 'border-cyan-500/45 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300',
    };
  }
  if (status === 'in_progress') {
    return {
      label: 'In Progress',
      cls: 'border-amber-500/45 bg-amber-500/15 text-amber-700 dark:text-amber-300',
    };
  }
  return {
    label: 'Needed',
    cls: 'border-amber-500/45 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  };
}

export function OpsAssetThumb({
  asset,
  alt,
  size = 'thumb',
  className = '',
}: {
  asset: Pick<JobAsset, 'url' | 'file' | 'kind' | 'altText' | 'label'> & {
    assignedTo?: string;
    status?: JobAsset['status'];
  };
  alt?: string;
  size?: 'thumb' | 'medium' | 'full';
  className?: string;
}) {
  const rawUrl =
    asset.url?.trim() ||
    (asset.file && (/^https?:\/\//i.test(asset.file) || asset.file.startsWith('/'))
      ? asset.file.trim()
      : '');
  const driveId =
    extractDriveFileId(rawUrl) || extractDriveFileId(asset.file, true);
  const isBlob = rawUrl.startsWith('/api/ops/asset-blob/');
  const needsAuthFetch = Boolean(driveId || isBlob);

  const [loadedBlob, setLoadedBlob] = useState<{ key: string; url: string } | null>(null);
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const [browserFallbackKey, setBrowserFallbackKey] = useState<string | null>(null);
  const [connectingDrive, setConnectingDrive] = useState(false);
  const [tokenVersion, setTokenVersion] = useState(0);

  useEffect(() => {
    const onTokenChange = () => setTokenVersion((v) => v + 1);
    window.addEventListener(DRIVE_TOKEN_EVENT, onTokenChange);
    return () => window.removeEventListener(DRIVE_TOKEN_EVENT, onTokenChange);
  }, []);

  const sz = size === 'thumb' ? 240 : size === 'medium' ? 640 : 1200;
  const fetchKey = `${rawUrl}|${driveId || ''}|${sz}|${tokenVersion}`;

  useEffect(() => {
    if (!needsAuthFetch || (!rawUrl && !driveId)) return;

    let cancelled = false;
    let createdUrl: string | null = null;

    (async () => {
      try {
        const user = getOpsAuth().currentUser;
        const idToken = user ? await user.getIdToken() : '';
        const driveToken = getGoogleDriveAccessToken();
        const endpoint = driveId
          ? `/api/ops/drive-image?fileId=${encodeURIComponent(driveId)}&sz=${sz}`
          : rawUrl;
        const headers: Record<string, string> = {};
        if (idToken) headers.Authorization = `Bearer ${idToken}`;
        if (driveId && driveToken) headers['X-Google-Access-Token'] = driveToken;

        const res = await fetch(endpoint, { headers, cache: 'no-store' });
        if (!res.ok) {
          if (driveId && driveToken) {
            const errJson = (await res.json().catch(() => null)) as {
              driveAuthRejected?: boolean;
            } | null;
            if (errJson?.driveAuthRejected) {
              clearGoogleDriveAccessToken();
            }
          }
          throw new Error(`HTTP ${res.status}`);
        }
        const blob = await res.blob();
        if (cancelled) return;
        createdUrl = URL.createObjectURL(blob);
        setLoadedBlob({ key: fetchKey, url: createdUrl });
      } catch {
        if (!cancelled) {
          if (driveId) {
            setBrowserFallbackKey(fetchKey);
          } else {
            setFailedKey(fetchKey);
          }
        }
      }
    })();

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [rawUrl, driveId, needsAuthFetch, sz, fetchKey]);

  const objectUrl = loadedBlob?.key === fetchKey ? loadedBlob.url : null;
  const directDriveThumb =
    driveId && browserFallbackKey === fetchKey
      ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(driveId)}&sz=w${sz}`
      : null;
  const resolvedSrc = needsAuthFetch ? objectUrl || directDriveThumb : rawUrl || null;
  const failed = failedKey === fetchKey;

  if (resolvedSrc && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolvedSrc}
        alt={alt || asset.altText || asset.label || asset.file || 'Asset preview'}
        className={className}
        referrerPolicy={directDriveThumb && !objectUrl ? 'strict-origin-when-cross-origin' : 'no-referrer'}
        onError={() => setFailedKey(fetchKey)}
      />
    );
  }

  const hasDriveToken = Boolean(getGoogleDriveAccessToken());
  const isUnuploadedPlaceholder = !rawUrl && !driveId;
  const emptyMessage = isUnuploadedPlaceholder
    ? asset.status === 'rejected'
      ? 'Rejected — no replacement uploaded yet'
      : asset.assignedTo
        ? `Awaiting upload from @${asset.assignedTo}`
        : 'Awaiting image upload'
    : asset.file || (failed ? 'Preview unavailable' : 'No preview');

  return (
    <div
      className={`flex flex-col items-center justify-center bg-muted/40 text-muted-foreground p-2 ${className}`}
    >
      {asset.kind === 'video' ? (
        <Film className="w-4 h-4 shrink-0" />
      ) : (
        <FileImage className="w-4 h-4 shrink-0" />
      )}
      {size !== 'thumb' && (
        <>
          <span className="mt-1 text-[10px] font-mono px-2 text-center truncate max-w-full">
            {emptyMessage}
          </span>
          {driveId && (!hasDriveToken || failed) && (
            <button
              type="button"
              disabled={connectingDrive}
              onClick={async (e) => {
                e.stopPropagation();
                setConnectingDrive(true);
                try {
                  await signInOpsWithGoogle();
                } catch {
                  // Token handler updates automatically on success
                } finally {
                  setConnectingDrive(false);
                }
              }}
              className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-accent/50 bg-accent/15 text-accent text-[11px] font-mono font-semibold hover:bg-accent/25 disabled:opacity-50"
            >
              <Lock className="w-3 h-3" />
              {connectingDrive
                ? 'Connecting...'
                : hasDriveToken
                  ? 'Reconnect Google Drive'
                  : 'Connect Drive to preview'}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export async function uploadHostedAssetImage(
  file: File,
  clientId: string
): Promise<{ url: string; filename: string }> {
  const user = getOpsAuth().currentUser;
  if (!user) throw new Error('Sign in required to upload hosted copy.');
  const token = await user.getIdToken();

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Failed to read file'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

  // Compress oversized images client-side via canvas if > 650 KB
  let payloadDataUrl = dataUrl;
  if (file.size > 650 * 1024 && file.type !== 'image/gif') {
    payloadDataUrl = await new Promise<string>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1400;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.84));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }

  const res = await fetch('/api/ops/asset-blob', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      clientId,
      dataUrl: payloadDataUrl,
      filename: file.name,
    }),
  });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) {
    throw new Error(data.error || `Upload failed (${res.status})`);
  }
  return { url: data.url, filename: file.name };
}

export function OpsAssetLightbox({
  asset,
  onClose,
}: {
  asset: JobAsset | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!asset) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [asset, onClose]);

  if (!asset) return null;
  const st = assetStatusBadge(asset.status);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-3xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <span className="px-1.5 py-0.5 rounded bg-muted text-foreground uppercase">
              {asset.kind.replace('_', ' ')}
            </span>
            <span className="px-1.5 py-0.5 rounded border border-accent/40 bg-accent/10 text-accent">
              {assetPlatformLabel(asset.platform)}
            </span>
            <span className={`px-1.5 py-0.5 rounded border ${st.cls}`}>{st.label}</span>
            {asset.label && (
              <span className="px-1.5 py-0.5 rounded border border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300">
                {asset.label}
              </span>
            )}
            {asset.spec && <span className="text-muted-foreground">{asset.spec}</span>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {asset.url && (
              <a
                href={asset.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-accent hover:underline"
              >
                Open Link <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close full-size preview"
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 bg-background/60 flex items-center justify-center max-h-[65vh] overflow-auto">
          <OpsAssetThumb
            asset={asset}
            size="full"
            className="max-h-[58vh] w-auto max-w-full rounded object-contain"
          />
        </div>

        <div className="px-4 py-3 border-t border-border text-xs space-y-1 bg-card">
          {asset.file && (
            <div>
              <span className="font-mono text-[10px] uppercase text-muted-foreground mr-1.5">File:</span>
              <span className="font-mono text-foreground">{asset.file}</span>
            </div>
          )}
          <div>
            <span className="font-mono text-[10px] uppercase text-muted-foreground mr-1.5">Alt Text:</span>
            <span className={asset.altText ? 'text-foreground' : 'text-amber-600 dark:text-amber-300'}>
              {asset.altText || 'Missing alt text'}
            </span>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase text-muted-foreground mr-1.5">Credit:</span>
            <span className={asset.credit ? 'text-foreground' : 'text-amber-600 dark:text-amber-300'}>
              {asset.credit || 'Missing credit'}
            </span>
            {asset.sourceUrl && (
              <>
                {' · '}
                <a
                  href={asset.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline font-mono text-[11px]"
                >
                  Source ↗
                </a>
              </>
            )}
          </div>
          {asset.caption && (
            <div>
              <span className="font-mono text-[10px] uppercase text-muted-foreground mr-1.5">Caption:</span>
              <span className="text-foreground/90">{asset.caption}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
