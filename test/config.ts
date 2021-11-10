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
const DEFAULT_CLIENT_ID = 'dummy-client-id';
const DEFAULT_CLIENT_SECRET = 'dummy-client-secret';
const DEFAULT_INSTALL_CODE = 'dummy-install-code';
const DEFAULT_INSTALL_ID = 'dummy-install-id';
const DEFAULT_REFRESH_TOKEN = 'dummy-refresh-token';

export const integrationConfig: IntegrationConfig = {
  authToken: process.env.AUTH_TOKEN || DEFAULT_AUTH_TOKEN,
  organizationSlug: process.env.ORGANIZATION_SLUG || DEFAULT_ORGANIZATION_SLUG,
  clientID: process.env.CLIENT_ID || DEFAULT_CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET || DEFAULT_CLIENT_SECRET,
  installCode: process.env.INSTALL_CODE || DEFAULT_INSTALL_CODE,
  installID: process.env.INSTALL_ID || DEFAULT_INSTALL_ID,
  refreshToken: process.env.REFRESH_TOKEN || DEFAULT_REFRESH_TOKEN,
};
