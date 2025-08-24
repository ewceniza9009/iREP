export interface DecodedToken {
  id: string;
  email: string;
  tenantId: string;
  roles: string[];
  exp: number;
  iat: number;
}

export interface User {
  id: string;
  email: string;
  tenantId: string;
  roles: string[];
}
