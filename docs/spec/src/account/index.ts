import { StepSpec, RelationshipClass } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../../../src/config';

export const accountSpec: StepSpec<IntegrationConfig>[] = [
  {
    /**
     * ENDPOINT: n/a
     * PATTERN: Singleton
     */
    id: 'fetch-organization',
    name: 'Fetch Organization Details',
    entities: [
      {
        resourceName: 'Organization',
        _type: 'sentry_organization',
        _class: ['Account'],
      },
    ],
    relationships: [
      {
        _type: 'sentry_organization_has_project',
        sourceType: 'sentry_organization',
        _class: RelationshipClass.HAS,
        targetType: 'sentry_project',
      },
      {
        _type: 'sentry_organization_has_team',
        sourceType: 'sentry_organization',
        _class: RelationshipClass.HAS,
        targetType: 'sentry_team',
      },
      {
        _type: 'sentry_organization_has_member',
        sourceType: 'sentry_organization',
        _class: RelationshipClass.HAS,
        targetType: 'sentry_member',
      },
    ],
    dependsOn: [],
    implemented: false,
  },
];
