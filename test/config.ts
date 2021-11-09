import * as dotenv from 'dotenv';
import * as path from 'path';
import { IntegrationConfig } from '../src/config';

if (process.env.LOAD_ENV) {
  dotenv.config({
    path: path.join(__dirname, '../.env'),
  });
}
const DEFAULT_AUTH_TOKEN = 'dummy-bearer-token';
const DEFAULT_ORGANIZATION_SLUG = 'jupiterone-integration-develop';

export const integrationConfig: IntegrationConfig = {
  authToken: process.env.AUTH_TOKEN || DEFAULT_AUTH_TOKEN,
  organizationSlug: process.env.ORGANIZATION_SLUG || DEFAULT_ORGANIZATION_SLUG,
};
