import * as dotenv from 'dotenv';
import * as path from 'path';
import { IntegrationConfig } from '../src/config';

if (process.env.LOAD_ENV) {
  dotenv.config({
    path: path.join(__dirname, '../.env'),
  });
}
const DEFAULT_CLIENT_TOKEN = 'dummy-bearer-token';

export const integrationConfig: IntegrationConfig = {
  clientToken: process.env.CLIENT_TOKEN || DEFAULT_CLIENT_TOKEN,
};
