// Providers often supply types with their API libraries.

export interface AcmeUser {
  id: string;
  name: string;
}

export interface AcmeGroup {
  id: string;
  name: string;
  users?: Pick<AcmeUser, 'id'>[];
}

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
  projects: SentryProject[];
}
