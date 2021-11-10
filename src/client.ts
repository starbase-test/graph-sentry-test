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
  private axiosAuthInstance: axios.AxiosInstance;
  private sentryBaseUrl: string;
  private sentryConfig: IntegrationConfig;

  constructor(readonly config: IntegrationConfig) {
    this.axiosInstance = Axios.create({
      headers: {
        Authorization: 'Bearer ' + config.authToken,
      },
    });
    this.axiosAuthInstance = Axios.create({});

    this.sentryConfig = config;
    this.sentryBaseUrl = 'https://sentry.io/api/0/';
  }

  // TODO, I'm not sure when we'd trigger this, but if we don't have our first token and refreshToken
  // yet, we need to do a slightly modified call to the Sentry authorization endpoint.
  public async generateToken() {
    const tokenURL = `${this.sentryBaseUrl}sentry-app-installations/${this.sentryConfig.installID}/authorizations/`;
    const tokenResp = await this.axiosAuthInstance.post(tokenURL, {
      grant_type: 'authorization_code',
      code: this.sentryConfig.installCode,
      client_id: this.sentryConfig.clientID,
      client_secret: this.sentryConfig.clientSecret,
    });

    this.sentryConfig.authToken = tokenResp.data.token;
    this.sentryConfig.refreshToken = tokenResp.data.refreshToken;

    delete this.axiosInstance.defaults.headers['Authorization'];
    this.axiosInstance.defaults.headers['Authorization'] =
      'Bearer ' + this.sentryConfig.authToken;
  }

  public async refreshToken() {
    const refreshURL = `${this.sentryBaseUrl}sentry-app-installations/${this.sentryConfig.installID}/authorizations/`;
    const refreshResp = await this.axiosAuthInstance.post(refreshURL, {
      grant_type: 'refresh_token',
      refresh_token: this.sentryConfig.refreshToken,
      client_id: this.sentryConfig.clientID,
      client_secret: this.sentryConfig.clientSecret,
    });

    this.sentryConfig.authToken = refreshResp.data.token;
    this.sentryConfig.refreshToken = refreshResp.data.refreshToken;

    delete this.axiosInstance.defaults.headers['Authorization'];
    this.axiosInstance.defaults.headers['Authorization'] =
      'Bearer ' + this.sentryConfig.authToken;
  }

  public async getWithTokenRefresh(
    url: string,
  ): Promise<axios.AxiosResponse<any, any>> {
    let returnVal;
    try {
      returnVal = await this.axiosInstance.get(url);
      return returnVal;
    } catch (err) {
      await this.refreshToken();
      returnVal = await this.axiosInstance.get(url);
      return returnVal;
    }
  }

  public async verifyAuthentication(): Promise<void> {
    // A call to the baseURL will return a valid 200 status as long as we have a
    // valid bearer token for authentication.
    try {
      await this.getWithTokenRefresh(this.sentryBaseUrl);
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

    url += `${this.sentryConfig.organizationSlug}/`;

    const orgResponse = await this.getWithTokenRefresh(url);
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
      const teamResponse = await this.getWithTokenRefresh(url);
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
      const projectResponse = await this.getWithTokenRefresh(url);
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
    const url = `${this.sentryBaseUrl}organizations/${organizationSlug}/users/`;
    let moreData = true;

    while (moreData) {
      const userResponse = await this.getWithTokenRefresh(url);
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
      const teamAssignmentResponse = await this.getWithTokenRefresh(url);
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
