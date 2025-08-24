import { Injectable, Scope } from '@nestjs/common';
import { JwtPayload } from './jwt-payload.interface';

@Injectable({ scope: Scope.REQUEST })
export class CurrentUser {
  private static currentUser: JwtPayload;

  static set(user: JwtPayload): void {
    this.currentUser = user;
  }
  
  static get(): JwtPayload {
    return this.currentUser;
  }

  static getTenantId(): string | null {
    return this.currentUser?.tenantId || null;
  }
}