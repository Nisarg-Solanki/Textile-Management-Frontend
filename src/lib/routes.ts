export const ROUTES = {
  // Home
  HOME: "/",

  // Auth
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  // Dashboard
  DASHBOARD: "/dashboard",

  // Admin — super_admin only
  ADMIN: {
    PENDING_USERS: "/admin/pending-users",
    USERS: "/admin/users",
    PERMISSIONS: (userId: string) => `/admin/permissions/${userId}`,
  },

  // Firms
  FIRMS: {
    LIST: "/firms",
    NEW: "/firms/new",
    DETAIL: (id: string) => `/firms/${id}`,
    EDIT: (id: string) => `/firms/${id}/edit`,
  },

  // Mills
  MILLS: {
    LIST: "/mills",
    NEW: "/mills/new",
    DETAIL: (id: string) => `/mills/${id}`,
    EDIT: (id: string) => `/mills/${id}/edit`,
  },

  // Beam Qualities — dialog only, no new/edit sub-pages
  BEAM_QUALITIES: {
    LIST: "/beam-qualities",
  },

  // Production Qualities — dialog only, no new/edit sub-pages
  PRODUCTION_QUALITIES: {
    LIST: "/production-qualities",
  },

  // Machines
  MACHINES: {
    LIST: "/machines",
    NEW: "/machines/new",
    DETAIL: (id: string) => `/machines/${id}`,
    EDIT: (id: string) => `/machines/${id}/edit`,
  },

  // Beams
  BEAMS: {
    LIST: "/beams",
    NEW: "/beams/new",
    DETAIL: (id: string) => `/beams/${id}`,
    EDIT: (id: string) => `/beams/${id}/edit`,
  },

  // Production Info
  PRODUCTION: {
    LIST: "/production",
    NEW: "/production/new",
    DETAIL: (id: string) => `/production/${id}`,
    EDIT: (id: string) => `/production/${id}/edit`,
  },

  // Taka — view only
  TAKAS: {
    LIST: "/takas",
    DETAIL: (id: string) => `/takas/${id}`,
  },

  // Mill Outverts
  MILL_OUTVERTS: {
    LIST: "/mill-outverts",
    NEW: "/mill-outverts/new",
    DETAIL: (id: string) => `/mill-outverts/${id}`,
    EDIT: (id: string) => `/mill-outverts/${id}/edit`,
  },

  // Mill Inverts
  MILL_INVERTS: {
    LIST: "/mill-inverts",
    NEW: "/mill-inverts/new",
    DETAIL: (id: string) => `/mill-inverts/${id}`,
    EDIT: (id: string) => `/mill-inverts/${id}/edit`,
  },

  // Machine Info — view only
  MACHINE_INFO: "/machine-info",

  // Mill Summary — view only
  MILL_SUMMARY: "/mill-summary",
} as const;
