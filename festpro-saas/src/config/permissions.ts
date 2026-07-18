export type PermissionCode =
  | "organization.create"
  | "organization.view"
  | "organization.edit"
  | "organization.delete"
  | "member.invite"
  | "member.view"
  | "member.edit"
  | "member.remove"
  | "festival.create"
  | "festival.view"
  | "festival.edit"
  | "festival.delete"
  | "competition.create"
  | "competition.view"
  | "competition.edit"
  | "competition.delete"
  | "participant.create"
  | "participant.view"
  | "participant.edit"
  | "participant.delete"
  | "participant.import"
  | "judge.assign"
  | "score.enter"
  | "score.view"
  | "score.lock"
  | "result.view"
  | "result.publish"
  | "certificate.generate"
  | "certificate.view"
  | "report.view"
  | "report.export"
  | "finance.view"
  | "finance.manage"
  | "settings.view"
  | "settings.manage"
  | "activity.view"
  | "audit.view"

import type { UserRole } from "@/types"

// Hardcoded role-permission mapping as fallback (DB is source of truth)
const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, PermissionCode[]> = {
  platform_owner: [
    "organization.create", "organization.view", "organization.edit", "organization.delete",
    "member.invite", "member.view", "member.edit", "member.remove",
    "festival.create", "festival.view", "festival.edit", "festival.delete",
    "competition.create", "competition.view", "competition.edit", "competition.delete",
    "participant.create", "participant.view", "participant.edit", "participant.delete", "participant.import",
    "judge.assign", "score.enter", "score.view", "score.lock",
    "result.view", "result.publish",
    "certificate.generate", "certificate.view",
    "report.view", "report.export",
    "finance.view", "finance.manage",
    "settings.view", "settings.manage",
    "activity.view", "audit.view",
  ],
  platform_admin: [
    "organization.create", "organization.view", "organization.edit",
    "member.invite", "member.view", "member.edit", "member.remove",
    "festival.create", "festival.view", "festival.edit", "festival.delete",
    "competition.create", "competition.view", "competition.edit", "competition.delete",
    "participant.view", "participant.edit", "participant.import",
    "judge.assign", "score.view",
    "result.view", "result.publish",
    "certificate.generate", "certificate.view",
    "report.view", "report.export",
    "finance.view",
    "settings.view", "settings.manage",
    "activity.view", "audit.view",
  ],
  organization_owner: [
    "organization.create", "organization.view", "organization.edit", "organization.delete",
    "member.invite", "member.view", "member.edit", "member.remove",
    "festival.create", "festival.view", "festival.edit", "festival.delete",
    "competition.create", "competition.view", "competition.edit", "competition.delete",
    "participant.create", "participant.view", "participant.edit", "participant.delete", "participant.import",
    "judge.assign", "score.enter", "score.view", "score.lock",
    "result.view", "result.publish",
    "certificate.generate", "certificate.view",
    "report.view", "report.export",
    "finance.view", "finance.manage",
    "settings.view", "settings.manage",
    "activity.view",
  ],
  organization_admin: [
    "organization.view", "organization.edit",
    "member.invite", "member.view", "member.edit", "member.remove",
    "festival.create", "festival.view", "festival.edit", "festival.delete",
    "competition.create", "competition.view", "competition.edit", "competition.delete",
    "participant.create", "participant.view", "participant.edit", "participant.import",
    "judge.assign", "score.view",
    "result.view", "result.publish",
    "certificate.generate", "certificate.view",
    "report.view", "report.export",
    "finance.view",
    "settings.view", "settings.manage",
    "activity.view",
  ],
  festival_director: [
    "organization.view",
    "festival.create", "festival.view", "festival.edit",
    "competition.create", "competition.view", "competition.edit",
    "participant.view", "participant.edit", "participant.import",
    "judge.assign", "score.view",
    "result.view", "result.publish",
    "certificate.generate", "certificate.view",
    "report.view",
    "activity.view",
  ],
  division_coordinator: [
    "organization.view",
    "festival.view",
    "competition.view", "competition.edit",
    "participant.view", "participant.edit",
    "score.view",
    "result.view",
    "report.view",
  ],
  sector_coordinator: [
    "organization.view",
    "festival.view",
    "competition.view",
    "participant.view",
    "result.view",
  ],
  unit_coordinator: [
    "festival.view",
    "competition.view",
    "participant.create", "participant.view", "participant.edit",
    "participant.import",
    "result.view",
  ],
  judge: [
    "competition.view",
    "participant.view",
    "score.enter", "score.view",
    "result.view",
  ],
  volunteer: [
    "festival.view",
    "competition.view",
    "participant.view",
  ],
  media: [
    "festival.view",
  ],
  reception: [
    "festival.view",
    "participant.view", "participant.create",
  ],
  finance: [
    "festival.view",
    "finance.view",
    "report.view", "report.export",
  ],
  participant: [
    "competition.view",
    "result.view",
    "certificate.view",
  ],
  public_user: [
    "festival.view",
  ],
}

export function hasPermission(role: UserRole, permission: PermissionCode): boolean {
  const perms = DEFAULT_ROLE_PERMISSIONS[role]
  if (!perms) return false
  return perms.includes(permission)
}

export function hasAnyPermission(role: UserRole, permissions: PermissionCode[]): boolean {
  return permissions.some((p) => hasPermission(role, p))
}

export function hasAllPermissions(role: UserRole, permissions: PermissionCode[]): boolean {
  return permissions.every((p) => hasPermission(role, p))
}

export function getPermissionsForRole(role: UserRole): PermissionCode[] {
  return DEFAULT_ROLE_PERMISSIONS[role] || []
}

export { DEFAULT_ROLE_PERMISSIONS }
