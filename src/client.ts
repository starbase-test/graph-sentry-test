import Axios, * as axios from 'axios';

import {
  IntegrationProviderAPIError,
  IntegrationLogger,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from './config';
import {
  SentryOrganization,
  SentryTeam,
  SentryProject,
  SentryUser,
} from './types';

export type ResourceIteratee<T> = (each: T) => Promise<void> | void;

/**
 * An APIClient maintains authentication state and provides an interface to
 * third party data APIs.
 *
 * It is recommended that integrations wrap provider data APIs to provide a
 * place to handle error responses and implement common patterns for iterating
 * resources.
 */
export class APIClient {
  private axiosInstance: axios.AxiosInstance;
  private sentryBaseUrl: string;
  private logger: IntegrationLogger;

  constructor(readonly config: IntegrationConfig, logger: IntegrationLogger) {
    this.axiosInstance = Axios.create({
      headers: {
        Authorization: 'Bearer ' + config.clientToken,
      },
    });
    this.sentryBaseUrl = 'https://sentry.io/api/0/';
    this.logger = logger;
  }

  public async verifyAuthentication(): Promise<void> {
    // A call to the baseURL will return a valid 200 status as long as we have a
    // valid bearer token for authentication.
    try {
      await this.axiosInstance.get(this.sentryBaseUrl);
    } catch (err) {
      this.logger.info(
        {
          err,
        },
        'Encounted error retrieving devices',
      );

      const response = err.response || {};

      if (response.status !== 200) {
        throw new IntegrationProviderAPIError({
          endpoint: this.sentryBaseUrl,
          status: response.status,
          statusText: response.statusText,
        });
      }
    }
  }

  /**
   * Iterates each group resource in the provider.
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateOrganizations(
    iteratee: ResourceIteratee<SentryOrganization>,
  ): Promise<void> {
    const url = this.sentryBaseUrl + 'organizations/';

    const orgResponse = await this.axiosInstance.get(url);
    const orgResults = orgResponse.data;

    for (const organization of orgResults) {
      await iteratee(organization);
    }
  }

  /**
   * Iterates each group resource in the provider.
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateTeams(
    iteratee: ResourceIteratee<SentryTeam>,
    organizationSlug: string,
  ): Promise<void> {
    const url = `${this.sentryBaseUrl}organizations/${organizationSlug}/teams/`;

    const teamResponse = await this.axiosInstance.get(url);
    const teamResults = teamResponse.data;

    for (const team of teamResults) {
      await iteratee(team);
    }
  }

  /**
   * Iterates each group resource in the provider.
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateProjects(
    iteratee: ResourceIteratee<SentryProject>,
    organizationSlug: string,
  ): Promise<void> {
    const url = `${this.sentryBaseUrl}organizations/${organizationSlug}/projects/`;

    const projectResponse = await this.axiosInstance.get(url);
    const projectResults = projectResponse.data;

    for (const project of projectResults) {
      await iteratee(project);
    }
  }

  /**
   * Iterates each user resource in the provider.
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateUsers(
    iteratee: ResourceIteratee<SentryUser>,
    organizationSlug: string,
  ): Promise<void> {
    const url = `${this.sentryBaseUrl}organizations/${organizationSlug}/users/`;

    const userResponse = await this.axiosInstance.get(url);
    const userResults = userResponse.data;

    for (const user of userResults) {
      await iteratee(user);
    }
  }

  /**
   * Iterates each group resource in the provider.
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateTeamAssignments(
    iteratee: ResourceIteratee<SentryUser>,
    orgSlug: string,
    teamSlug: string,
  ): Promise<void> {
    const url = `${this.sentryBaseUrl}teams/${orgSlug}/${teamSlug}/members/`;

    console.log(`Getting team assignments with ${url}`);
    const teamAssignmentResponse = await this.axiosInstance.get(url);
    const teamAssignmentResults = teamAssignmentResponse.data;

    for (const member of teamAssignmentResults) {
      await iteratee(member);
    }
  }
}

export function createAPIClient(
  config: IntegrationConfig,
  logger: IntegrationLogger,
): APIClient {
  return new APIClient(config, logger);
}
