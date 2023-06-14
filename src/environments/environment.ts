// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { GeneralService } from "src/app/services/general/general.service";

export const environment = {
  production: false,
  baseUrl: 'https://ulp.uniteframework.io/ulp-bff',
  schemaUrl: 'assets/config/schema.json', //asset path OR URL
  logo: 'assets/images/logo.png', //asset path OR URL
  keycloakConfig: {
    url: 'https://sunbird-certificate-demo.xiv.in/auth',
    realm: 'sunbird-rc',
    clientId: 'registry-frontend'
  }
};
