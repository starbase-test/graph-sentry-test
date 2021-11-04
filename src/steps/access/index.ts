import {
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { createAPIClient } from '../../client';
import { IntegrationConfig } from '../../config';
import { Entities, Steps, Relationships } from '../constants';
import {
  createSentryProjectEntity,
  createSentryProjectRelationship,
  createSentryTeamAssignedProjectRelationship,
  createSentryTeamEntity,
  createSentryTeamRelationship,
  createSentryUserEntity,
  createSentryUserRelationship,
} from './converter';

export async function fetchProjects({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config);
  await jobState.iterateEntities(
    { _type: Entities.ORGANIZATION._type },
    async (organization) => {
      const organizationSlug: string = String(organization.slug);
      if (organizationSlug) {
        await apiClient.iterateProjects(async (projectData) => {
          const projectEntity = await jobState.addEntity(
            createSentryProjectEntity(projectData),
          );
          await jobState.addRelationship(
            createSentryProjectRelationship(organization, projectEntity),
          );
        }, organizationSlug);
      }
    },
  );
}

export async function fetchTeams({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config);
  await jobState.iterateEntities(
    { _type: Entities.ORGANIZATION._type },
    async (organization) => {
      const organizationSlug: string = String(organization.slug);
      if (organizationSlug) {
        await apiClient.iterateTeams(async (teamData) => {
          const teamEntity = await jobState.addEntity(
            createSentryTeamEntity(teamData),
          );
          await jobState.addRelationship(
            createSentryTeamRelationship(organization, teamEntity),
          );
          for (const project of teamData.projects) {
            const projectEntity = await jobState.findEntity(
              `sentry-project-${project.id}`,
            );
            if (projectEntity) {
              await jobState.addRelationship(
                createSentryTeamAssignedProjectRelationship(
                  teamEntity,
                  projectEntity,
                ),
              );
            }
          }
        }, organizationSlug);
      }
    },
  );
}

export async function fetchUsers({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config);
  await jobState.iterateEntities(
    { _type: Entities.ORGANIZATION._type },
    async (organization) => {
      const organizationSlug: string = String(organization.slug);
      if (organizationSlug) {
        await apiClient.iterateUsers(async (userData) => {
          const userEntity = await jobState.addEntity(
            createSentryUserEntity(userData),
          );
          await jobState.addRelationship(
            createSentryUserRelationship(organization, userEntity),
          );
        }, organizationSlug);
      }
    },
  );
}

export async function fetchUserAssignments({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config);
  await jobState.iterateRelationships(
    { _type: Relationships.ORGANIZATION_HAS_TEAM._type },
    async (orgHasTeam) => {
      if (orgHasTeam._fromEntityKey && orgHasTeam._toEntityKey) {
        const orgEntity = await jobState.findEntity(
          String(orgHasTeam._fromEntityKey),
        );
        const teamEntity = await jobState.findEntity(
          String(orgHasTeam._toEntityKey),
        );
        if (orgEntity && teamEntity) {
          const orgSlug: string = String(orgEntity.slug);
          const teamSlug: string = String(teamEntity.slug);
          if (orgSlug && teamSlug) {
            await apiClient.iterateTeamAssignments(
              async (teamMember) => {
                const userEntity = await jobState.findEntity(
                  `sentry-user-${teamMember.id}`,
                );
                if (userEntity) {
                  await jobState.addRelationship(
                    createSentryUserRelationship(teamEntity, userEntity),
                  );
                }
              },
              orgSlug,
              teamSlug,
            );
          }
        }
      }
    },
  );
}

export const accessSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: Steps.PROJECTS,
    name: 'Fetch Projects',
    entities: [Entities.PROJECT],
    relationships: [Relationships.ORGANIZATION_HAS_PROJECT],
    dependsOn: [Steps.ORGANIZATIONS],
    executionHandler: fetchProjects,
  },
  {
    id: Steps.TEAMS,
    name: 'Fetch Teams',
    entities: [Entities.TEAM],
    relationships: [
      Relationships.ORGANIZATION_HAS_TEAM,
      Relationships.TEAM_ASSIGNED_PROJECT,
    ],
    dependsOn: [Steps.ORGANIZATIONS, Steps.PROJECTS],
    executionHandler: fetchTeams,
  },
  {
    id: Steps.USERS,
    name: 'Fetch Members',
    entities: [Entities.MEMBER],
    relationships: [Relationships.ORGANIZATION_HAS_USER],
    dependsOn: [Steps.ORGANIZATIONS],
    executionHandler: fetchUsers,
  },
  {
    id: Steps.USER_MEMBERSHIP,
    name: 'Fetch Teams Members',
    entities: [],
    relationships: [Relationships.TEAM_HAS_USER],
    dependsOn: [Steps.TEAMS, Steps.USERS],
    executionHandler: fetchUserAssignments,
  },
];
