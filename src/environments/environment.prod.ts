export const environment = {
  production: true,
  environmentName: 'PROD',
  isSaasIntegrated: true,
  apiUrl: '/mvp/api/',
  authSettings: {
    authApiBaseUrl: `${window.origin}/api`,
    accessTokenRoute: '/authorize',
    productNameHeader: 'x-product-name',
    productName: 'Syndicated Primary Research'
  },
  amcharts5LicenseKey: 'AM5C406471043',
};
