import { UserFunctions } from "./permission.model";

export interface CurrentSession {
  audience: string;
  issuer: string;
  expiresIn: number;
  tenantId: string;
  roles: string[];
  emailAddress: string;
  givenName: string;
  tenantName: string;
  surname: string;
  department: string;
  tenantRoles: string;
  functions: UserFunctions[];
}
