import { RelationshipClass, StepSpec } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../../../src/config';

export const accessSpec: StepSpec<IntegrationConfig>[] = [
  {
    /**
     * ENDPOINT:
     * PATTERN: Fetch Entities
     * There doesn't appear to be any way to fetch roles.  At the moment they are a static list.
     */
    id: 'fetch-roles',
    name: 'Fetch Roles',
    entities: [
      {
        resourceName: 'Role',
        _type: 'sentry_role',
        _class: ['AccessRole'],
      },
    ],
    relationships: [],
    dependsOn: [],
    implemented: false,
  },
  {
    /**
     * ENDPOINT: /api/0/organizations/{organization_slug}/users/
     * PATTERN: Fetch Entities? or Fetch Relationshoips?
     */
    id: 'fetch-members',
    name: 'Fetch Members',
    entities: [
      {
        resourceName: 'Member',
        _type: 'sentry_member',
        _class: ['User'],
      },
    ],
    relationships: [
      {
        _type: 'sentry_member_has_role',
        sourceType: 'sentry_member',
        _class: RelationshipClass.ASSIGNED,
        targetType: 'sentry_role',
      },
    ],
    dependsOn: ['fetch-roles'],
    implemented: false,
  },
  {
    /**
     * ENDPOINT: /api/0/organizations/{organization_slug}/teams/
     * PATTERN: Fetch Entities? or Fetch Child Entities?
     */
    id: 'fetch-teams',
    name: 'Fetch Teams',
    entities: [
      {
        resourceName: 'Team',
        _type: 'sentry_team',
        _class: ['UserGroup'],
      },
    ],
    relationships: [
      {
        _type: 'sentry_team_assigned_project',
        sourceType: 'sentry_team',
        _class: RelationshipClass.ASSIGNED,
        targetType: 'sentry_project',
      },
      {
        _type: 'sentry_team_has_member',
        sourceType: 'sentry_team',
        _class: RelationshipClass.HAS,
        targetType: 'sentry_member',
      },
    ],
    dependsOn: ['fetch-projects', 'fetch-members'],
    implemented: false,
  },
  {
    /**
     * ENDPOINT: /api/0/organizations/{organization_slug}/projects/
     * PATTERN: Fetch Entities? or Fetch Chiled Entities?
     */
    id: 'fetch-projects',
    name: 'Fetch Projects',
    entities: [
      {
        resourceName: 'Project',
        _type: 'sentry_project',
        _class: ['Project'],
      },
    ],
    relationships: [],
    dependsOn: [],
    implemented: false,
  },
];
