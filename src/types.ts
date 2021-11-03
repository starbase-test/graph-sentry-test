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
  user: { has2fa: boolean };
  projects: SentryProject[];
}
