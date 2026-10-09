export type StudioRole = "admin" | "editor" | "reviewer" | "viewer";
export type StudioAction =
  | "briefing:read"
  | "briefing:create"
  | "briefing:update"
  | "briefing:delete"
  | "briefing:review"
  | "user:manage";
export const ROLES: readonly StudioRole[];
export function can(role: string, action: string): boolean;
export function assertAuthorized(
  user: { active: boolean; role: string } | null | undefined,
  action: string,
): true;
export function validTransition(
  from: string,
  to: string,
  role: string,
): boolean;
