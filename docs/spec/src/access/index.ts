import { RelationshipClass, StepSpec } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../../../src/config';

export const accessSpec: StepSpec<IntegrationConfig>[] = [
  {
    /**
     * ENDPOINT: /api/0/organizations/{organization_slug}/users/
     * PATTERN: Fetch Entities
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
        _type: 'sentry_organization_has_member',
        sourceType: 'sentry_organization',
        _class: RelationshipClass.HAS,
        targetType: 'sentry_member',
      },
    ],
    dependsOn: ['fetch-organization'],
    implemented: false,
  },
  {
    /**
     * ENDPOINT: /api/0/organizations/{organization_slug}/users/
     * PATTERN: Build Child Relationships
     */
    id: 'fetch-member-projects',
    name: 'Fetch Member Projects',
    entities: [],
    relationships: [
      {
        _type: 'sentry_project_has_member',
        sourceType: 'sentry_project',
        _class: RelationshipClass.HAS,
        targetType: 'sentry_member',
      },
    ],
    dependsOn: ['fetch-members'],
    implemented: false,
  },
  {
    /**
     * ENDPOINT: /api/0/organizations/{organization_slug}/teams/
     * PATTERN: Fetch Child Entities
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
        _type: 'sentry_organization_has_team',
        sourceType: 'sentry_organization',
        _class: RelationshipClass.HAS,
        targetType: 'sentry_team',
      },
    ],
    dependsOn: ['fetch-organization'],
    implemented: false,
  },
  {
    /**
     * ENDPOINT: /api/0/organizations/{organization_slug}/teams/
     * PATTERN: Build Child Relationships
     */
    id: 'fetch-teams-projects',
    name: 'Fetch Teams Projects',
    entities: [],
    relationships: [
      {
        _type: 'sentry_team_assigned_project',
        sourceType: 'sentry_team',
        _class: RelationshipClass.ASSIGNED,
        targetType: 'sentry_project',
      },
    ],
    dependsOn: ['fetch-teams'],
    implemented: false,
  },
  {
    /**
     * ENDPOINT: /api/0/teams/{{team_name}}/{{team_name}}/members/
     * PATTERN: Build Child Relationships
     */
    id: 'fetch-teams-members',
    name: 'Fetch Teams Members',
    entities: [],
    relationships: [
      {
        _type: 'sentry_team_has_member',
        sourceType: 'sentry_team',
        _class: RelationshipClass.HAS,
        targetType: 'sentry_member',
      },
    ],
    dependsOn: ['fetch-teams'],
    implemented: false,
  },
  {
    /**
     * ENDPOINT: /api/0/organizations/{organization_slug}/projects/
     * PATTERN: Fetch Entities
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
    relationships: [
      {
        _type: 'sentry_organization_has_project',
        sourceType: 'sentry_organization',
        _class: RelationshipClass.HAS,
        targetType: 'sentry_project',
      },
    ],
    dependsOn: ['fetch-organization'],
    implemented: false,
  },
];
