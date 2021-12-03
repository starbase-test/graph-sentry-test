export interface SentryOrganization {
  id: string;
  name: string;
  slug: string;
}

export interface SentryTeam {
  id: string;
  name: string;
  slug: string;
  projects: SentryProject[];
}

export interface SentryProject {
  id: string;
  name: string;
}

export interface SentryUser {
  id: string;
  name: string;
  email: string;
  role: string;
  dateCreated: string; // Date
  user?: {
    dateJoined: string; // Date
    has2fa: boolean;
    hasPasswordAuth: boolean;
    isActive: boolean;
    isManaged: boolean;
    isStaff: boolean;
    isSuperuser: boolean;
    lastActive: string; // Date
    lastLogin: string; // Date
  };
  projects?: SentryProject[];
}
