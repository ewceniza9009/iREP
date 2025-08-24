import { Injectable, Scope, Provider, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { JwtPayload } from './jwt-payload.interface';

@Injectable({ scope: Scope.REQUEST })
export class CurrentUser {
  constructor(@Inject(REQUEST) private readonly request: { user?: JwtPayload }) {}

  getUser(): JwtPayload | null {
    return this.request.user ?? null;
  }

  getTenantId(): string | null {
    return this.request.user?.tenantId ?? null;
  }

  getUserId(): string | null {
    return this.request.user?.id ?? null;
  }
}

export const CurrentUserProvider: Provider = {
  provide: CurrentUser,
  useClass: CurrentUser,
  scope: Scope.REQUEST,
};