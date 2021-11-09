import {
  getRawData,
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { createAPIClient } from '../../client';
import { IntegrationConfig } from '../../config';
import { SentryTeam } from '../../types';
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
        await apiClient.iterateProjects(
          organizationSlug,
          async (projectData) => {
            const projectEntity = await jobState.addEntity(
              createSentryProjectEntity(projectData),
            );
            await jobState.addRelationship(
              createSentryProjectRelationship(organization, projectEntity),
            );
          },
        );
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
        await apiClient.iterateTeams(organizationSlug, async (teamData) => {
          const teamEntity = await jobState.addEntity(
            createSentryTeamEntity(teamData),
          );
          await jobState.addRelationship(
            createSentryTeamRelationship(organization, teamEntity),
          );
        });
      }
    },
  );
}

export async function fetchTeamsAssignments({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  await jobState.iterateEntities(
    { _type: Entities.TEAM._type },
    async (teamEntity) => {
      // Do the following in a subsequent call to get data to add relationships.
      const teamData = getRawData<SentryTeam>(teamEntity);
      if (teamData) {
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
        await apiClient.iterateUsers(organizationSlug, async (userData) => {
          const userEntity = await jobState.addEntity(
            createSentryUserEntity(userData),
          );
          await jobState.addRelationship(
            createSentryUserRelationship(organization, userEntity),
          );
        });
      }
    },
  );
}

export async function fetchUserAssignments({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config);
  await jobState.iterateEntities(
    { _type: Entities.TEAM._type },
    async (teamEntity) => {
      const organizationSlug = instance.config.organizationSlug;
      if (teamEntity) {
        const teamSlug: string = String(teamEntity.slug);
        if (organizationSlug && teamSlug) {
          await apiClient.iterateTeamAssignments(
            organizationSlug,
            teamSlug,
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
          );
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
    relationships: [Relationships.ORGANIZATION_HAS_TEAM],
    dependsOn: [Steps.ORGANIZATIONS],
    executionHandler: fetchTeams,
  },
  {
    id: Steps.TEAMS_ASSIGNED_PROJECT,
    name: 'Fetch Teams Assigned to Projects',
    entities: [],
    relationships: [Relationships.TEAM_ASSIGNED_PROJECT],
    dependsOn: [Steps.TEAMS, Steps.PROJECTS],
    executionHandler: fetchTeamsAssignments,
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
