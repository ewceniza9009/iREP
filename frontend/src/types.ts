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

export interface Property {
  id: string;
  title: string;
  description?: string;
  propertyType: string;
  status: string;
  price?: number;
  bedrooms?: number;
  addressLine1: string;
  city: string;
  createdAt: string;
}