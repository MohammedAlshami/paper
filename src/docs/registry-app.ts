import type { ComponentEntry } from './registry';
import { APP_AUTH_COMPONENTS } from './registry-app-auth';
import { APP_COURIER_COMPONENTS } from './registry-app-courier';
import { APP_DATA_COMPONENTS } from './registry-app-data';
import { APP_GARAGE_COMPONENTS } from './registry-app-garage';
import { APP_LAYOUT_COMPONENTS } from './registry-app-layout';
import { APP_LEDGER_COMPONENTS } from './registry-app-ledger';
import { APP_SAAS_COMPONENTS } from './registry-app-saas';

/** The app family: the building blocks the templates are made of. Four files, one per group, merged here. */
export const APP_COMPONENTS: ComponentEntry[] = [...APP_LAYOUT_COMPONENTS, ...APP_AUTH_COMPONENTS, ...APP_DATA_COMPONENTS, ...APP_SAAS_COMPONENTS, ...APP_COURIER_COMPONENTS, ...APP_GARAGE_COMPONENTS, ...APP_LEDGER_COMPONENTS];
