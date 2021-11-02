import { accessSteps } from './access';
import { organizationSteps } from './account';

const integrationSteps = [...organizationSteps, ...accessSteps];

export { integrationSteps };
