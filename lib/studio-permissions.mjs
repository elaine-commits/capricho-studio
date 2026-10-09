export const ROLES = Object.freeze(["admin", "editor", "reviewer", "viewer"]);
const PERMISSIONS = Object.freeze({
  admin: [
    "briefing:read",
    "briefing:create",
    "briefing:update",
    "briefing:delete",
    "briefing:review",
    "user:manage",
  ],
  editor: ["briefing:read", "briefing:create", "briefing:update"],
  reviewer: ["briefing:read", "briefing:review"],
  viewer: ["briefing:read"],
});
export function can(role, action) {
  return (
    typeof role === "string" &&
    typeof action === "string" &&
    Object.hasOwn(PERMISSIONS, role) &&
    PERMISSIONS[role].includes(action)
  );
}
export function assertAuthorized(user, action) {
  if (!user || user.active !== true || !can(user.role, action)) {
    const error = new Error("Acesso não autorizado");
    error.code = "FORBIDDEN";
    throw error;
  }
  return true;
}
export function validTransition(from, to, role) {
  if (
    from === to ||
    !["draft", "in_review", "approved", "rejected", "archived"].includes(from)
  )
    return false;
  if (role === "admin")
    return (
      {
        draft: ["in_review", "archived"],
        in_review: ["approved", "rejected", "draft"],
        approved: ["archived"],
        rejected: ["draft", "archived"],
        archived: [],
      }[from] ?? []
    ).includes(to);
  if (role === "editor")
    return (
      (from === "draft" && to === "in_review") ||
      (from === "rejected" && to === "draft")
    );
  if (role === "reviewer")
    return from === "in_review" && ["approved", "rejected"].includes(to);
  return false;
}
