/**
 * Utility functions to prefetch critical administrative page chunks on user interaction
 * (mouse-over, focus, touch-start) to ensure near-instant load times when requested.
 */

let isAllAdminPrefetched = false;

export function prefetchAdminPages() {
  if (isAllAdminPrefetched) return;
  isAllAdminPrefetched = true;

  // Prefetch critical administrative routes
  import('../pages/admin/DashboardPage').catch(() => {});
  import('../pages/admin/LoginPage').catch(() => {});
  import('../pages/admin/RomEditorPage').catch(() => {});
  import('../pages/admin/ProfilePage').catch(() => {});
  import('../pages/admin/ApproveAdminsPage').catch(() => {});
  import('../pages/admin/SecurityLogsPage').catch(() => {});
  import('../pages/admin/FeedbackAdminPage').catch(() => {});
  import('../pages/admin/RegisterPage').catch(() => {});
  import('../pages/admin/ResetPasswordPage').catch(() => {});
}

export function prefetchRomEditorPage() {
  import('../pages/admin/RomEditorPage').catch(() => {});
}

export function prefetchAdminProfilePage() {
  import('../pages/admin/ProfilePage').catch(() => {});
}

export function prefetchApproveAdminsPage() {
  import('../pages/admin/ApproveAdminsPage').catch(() => {});
}

export function prefetchSecurityLogsPage() {
  import('../pages/admin/SecurityLogsPage').catch(() => {});
}

export function prefetchFeedbackAdminPage() {
  import('../pages/admin/FeedbackAdminPage').catch(() => {});
}
