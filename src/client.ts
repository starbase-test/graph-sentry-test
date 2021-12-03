import Axios, * as axios from 'axios';

import { IntegrationProviderAuthenticationError } from '@jupiterone/integration-sdk-core';

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
  private sentryOrganization: string | null;

  constructor(readonly config: IntegrationConfig) {
    this.axiosInstance = Axios.create({
      headers: {
        Authorization: 'Bearer ' + config.authToken,
      },
    });
    this.sentryBaseUrl = 'https://sentry.io/api/0/';

    this.sentryOrganization = config.organizationSlug;
  }

  public async verifyAuthentication(): Promise<void> {
    // A call to the baseURL will return a valid 200 status as long as we have a
    // valid bearer token for authentication.
    try {
      await this.axiosInstance.get(this.sentryBaseUrl);
    } catch (err) {
      const response = err.response || {};

      throw new IntegrationProviderAuthenticationError({
        endpoint: this.sentryBaseUrl,
        status: response.status,
        statusText: response.statusText,
      });
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
    let url = this.sentryBaseUrl + 'organizations/';

    url += `${this.sentryOrganization}/`;

    const orgResponse = await this.axiosInstance.get(url);
    const orgResults = orgResponse.data;

    await iteratee(orgResults);
  }

  /**
   * Iterates each group resource in the provider.
   *
   * @param orgSlug added to URL to specify correct Sentry organization
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateTeams(
    organizationSlug: string,
    iteratee: ResourceIteratee<SentryTeam>,
  ): Promise<void> {
    const url = `${this.sentryBaseUrl}organizations/${organizationSlug}/teams/`;
    let moreData = true;

    while (moreData) {
      const teamResponse = await this.axiosInstance.get(url);
      const teamResults = teamResponse.data;

      const teamHeaders = teamResponse.headers;
      moreData = Boolean(teamHeaders.results); //results=true when more than 100 results are available

      for (const team of teamResults) {
        await iteratee(team);
      }
    }
  }

  /**
   * Iterates each group resource in the provider.
   *
   * @param orgSlug added to URL to specify correct Sentry organization
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateProjects(
    organizationSlug: string,
    iteratee: ResourceIteratee<SentryProject>,
  ): Promise<void> {
    const url = `${this.sentryBaseUrl}organizations/${organizationSlug}/projects/`;
    let moreData = true;

    while (moreData) {
      const projectResponse = await this.axiosInstance.get(url);
      const projectResults = projectResponse.data;

      const projectHeaders = projectResponse.headers;
      moreData = Boolean(projectHeaders.results); //results=true when more than 100 results are available

      for (const project of projectResults) {
        await iteratee(project);
      }
    }
  }

  /**
   * Iterates each user resource in the provider.
   *
   * @param orgSlug added to URL to specify correct Sentry organization
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateUsers(
    organizationSlug: string,
    iteratee: ResourceIteratee<SentryUser>,
  ): Promise<void> {
    const url = `${this.sentryBaseUrl}organizations/${organizationSlug}/members/`;
    let moreData = true;

    while (moreData) {
      const userResponse = await this.axiosInstance.get(url);
      const userResults = userResponse.data;

      const userHeaders = userResponse.headers;
      moreData = Boolean(userHeaders.results); //results=true when more than 100 results are available

      for (const user of userResults) {
        await iteratee(user);
      }
    }
  }

  /**
   * Iterates each group resource in the provider.
   *
   * @param orgSlug added to URL to specify correct Sentry organization
   * @param teamSlug added to URL to specify correct Sentry team
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateTeamAssignments(
    orgSlug: string,
    teamSlug: string,
    iteratee: ResourceIteratee<SentryUser>,
  ): Promise<void> {
    const url = `${this.sentryBaseUrl}teams/${orgSlug}/${teamSlug}/members/`;
    let moreData = true;

    while (moreData) {
      const teamAssignmentResponse = await this.axiosInstance.get(url);
      const teamAssignmentResults = teamAssignmentResponse.data;

      const teamAssignmentHeaders = teamAssignmentResponse.headers;
      moreData = Boolean(teamAssignmentHeaders.results); //results=true when more than 100 results are available

      for (const member of teamAssignmentResults) {
        await iteratee(member);
      }
    }
  }
}

export function createAPIClient(config: IntegrationConfig): APIClient {
  return new APIClient(config);
}
