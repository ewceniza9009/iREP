// services/api-gateway/src/auth/types.ts
export interface JwtPayload {
  id: string; // User ID
  tenantId: string; // Organization/Tenant ID
  email: string;
  roles: string[];
}