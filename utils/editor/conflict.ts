/**
 * Conflict Detection Utilities
 * Detects concurrent edits using modified_at timestamps
 */

import type { Article, CaseStudy } from '@/types';

type RecordType = Article | CaseStudy;

export interface ConflictInfo {
  hasConflict: boolean;
  clientModified: string | null;
  serverModified: string | null;
  message: string;
}

/**
 * Checks if client version conflicts with server version
 * Compares modified_at timestamps to detect concurrent edits
 */
export function checkConflict(
  clientRecord: RecordType,
  serverRecord: RecordType
): ConflictInfo {
  const clientModified = clientRecord.modified_at;
  const serverModified = serverRecord.modified_at;

  // If no timestamps, no conflict
  if (!clientModified || !serverModified) {
    return {
      hasConflict: false,
      clientModified,
      serverModified,
      message: '',
    };
  }

  // Parse timestamps
  const clientTime = new Date(clientModified).getTime();
  const serverTime = new Date(serverModified).getTime();

  // Conflict if server was modified after client
  const hasConflict = serverTime > clientTime;

  return {
    hasConflict,
    clientModified,
    serverModified,
    message: hasConflict
      ? 'This record was modified by another session. Please refresh to see the latest changes.'
      : '',
  };
}

/**
 * Resolves conflict by taking server version
 */
export function resolveConflictByServer(
  clientRecord: RecordType,
  serverRecord: RecordType
): RecordType {
  return serverRecord;
}

/**
 * Resolves conflict by merging (client takes precedence for specific fields)
 */
export function resolveConflictByMerge(
  clientRecord: RecordType,
  serverRecord: RecordType
): RecordType {
  // Merge strategy: keep client's current edits but preserve server's modified_at
  return {
    ...clientRecord,
    modified_at: serverRecord.modified_at,
  } as RecordType;
}
