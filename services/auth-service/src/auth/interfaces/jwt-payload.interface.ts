// services/auth-service/src/auth/interfaces/jwt-payload.interface.ts
export interface JwtPayload {
  id: string;
  tenantId: string;
  email: string;
  roles: string[];
}