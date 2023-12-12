import { BucketInput } from './types';

// actualizar información según el cliente y su organización
const CUSTOMER = 'prevalentware';
const PROJECT = 'boilerplate';
const APP_NAME = 'boilerplate';
const REGION = 'us-east-1';
const ACCOUNT = '978879774573';
const CIDR_RANGE = '15.0.0.0/16'; // este rango de CIDR se debe consultar en el SharePoint de infraestructura.
const REPO = 'web-boiler-back-lambda';

// actualizar información según los buckets que sean necesarios.
// El boilerplate va a crear un bucket para dev y otro para prod, usando el nombre del bucket con -dev o -prod al final.
const BUCKETS: BucketInput[] = [
  { name: 'prevalentware-boilerplate' },
  { name: 'prevalentware-boilerplate-public', isPublic: true },
];

export { CUSTOMER, PROJECT, ACCOUNT, REGION, APP_NAME, CIDR_RANGE, BUCKETS, REPO };
