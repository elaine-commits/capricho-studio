export interface BackupBriefing {
  id: string;
  title: string;
  brand: string;
  channel: string;
  sku: string;
  objective: string;
  createdAt: string;
}
export function validateBackup(input: unknown): BackupBriefing[];
export function mergeBriefings<T extends { id: string }>(
  current: T[],
  incoming: T[],
): T[];
