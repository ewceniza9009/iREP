export interface JwtPayload {
  id: string;
  tenantId: string;
  email: string;
  roles: string[];
}