import {
  createIntegrationEntity,
  Entity,
} from '@jupiterone/integration-sdk-core';
import { SentryOrganization } from '../../types';

import { Entities } from '../constants';

export function createOrganizationEntity(
  organization: SentryOrganization,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: organization,
      assign: {
        _key: `sentry-organization-${organization.id}`,
        _type: Entities.ORGANIZATION._type,
        _class: Entities.ORGANIZATION._class,
        slug: organization.slug,
      },
    },
  });
}
