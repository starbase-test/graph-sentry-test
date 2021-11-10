import {
  IntegrationExecutionContext,
  IntegrationValidationError,
  IntegrationInstanceConfigFieldMap,
  IntegrationInstanceConfig,
} from '@jupiterone/integration-sdk-core';
import { createAPIClient } from './client';

/**
 * A type describing the configuration fields required to execute the
 * integration for a specific account in the data provider.
 *
 * When executing the integration in a development environment, these values may
 * be provided in a `.env` file with environment variables. For example:
 *
 * - `CLIENT_ID=123` becomes `instance.config.clientId = '123'`
 * - `CLIENT_SECRET=abc` becomes `instance.config.clientSecret = 'abc'`
 *
 * Environment variables are NOT used when the integration is executing in a
 * managed environment. For example, in JupiterOne, users configure
 * `instance.config` in a UI.
 */
export const instanceConfigFields: IntegrationInstanceConfigFieldMap = {
  authToken: {
    type: 'string',
    mask: true,
  },
  organizationSlug: {
    type: 'string',
    mask: true,
  },
  clientID: {
    type: 'string',
    mask: true,
  },
  clientSecret: {
    type: 'string',
    mask: true,
  },
  installCode: {
    type: 'string',
    mask: true,
  },
  installID: {
    type: 'string',
    mask: true,
  },
  refreshToken: {
    type: 'string',
    mask: true,
  },
};

/**
 * Properties provided by the `IntegrationInstance.config`. This reflects the
 * same properties defined by `instanceConfigFields`.
 */
export interface IntegrationConfig extends IntegrationInstanceConfig {
  /**
   * The provider API token used to authenticate requests.
   */
  authToken: string;
  /**
   * Organizational slug used to specify correct URL for API calls.
   */
  organizationSlug: string;
  /**
   * Organizational slug used to specify correct URL for API calls.
   */
  clientID: string;
  /**
   * Organizational slug used to specify correct URL for API calls.
   */
  clientSecret: string;
  /**
   * Organizational slug used to specify correct URL for API calls.
   */
  installCode: string;
  /**
   * Organizational slug used to specify correct URL for API calls.
   */
  installID: string;
  /**
   * Organizational slug used to specify correct URL for API calls.
   */
  refreshToken: string;
}

export async function validateInvocation(
  context: IntegrationExecutionContext<IntegrationConfig>,
) {
  const { config } = context.instance;

  if (
    !config.authToken ||
    !config.organizationSlug ||
    !config.clientID ||
    !config.clientSecret ||
    !config.installCode ||
    !config.installID ||
    !config.refreshToken
  ) {
    throw new IntegrationValidationError(
      'Config requires all of {authToken, organizationSlug, clientID, clientSecret, installCode, installID, refreshToken }',
    );
  }

  const apiClient = createAPIClient(config);
  await apiClient.verifyAuthentication();
}
