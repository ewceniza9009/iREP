import { Scope, Provider, Inject, Logger } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { JwtPayload } from './jwt-payload.interface';

const logger = new Logger('CurrentUserProvider');

export const CurrentUserProvider: Provider = {
  provide: 'CurrentUser',
  scope: Scope.REQUEST,
  useFactory: (request: Request) => {
    const userHeader = request?.headers?.user;
    let user: JwtPayload | null = null;
    if (userHeader && typeof userHeader === 'string') {
      try {
        user = JSON.parse(userHeader);
      } catch (e) {
        logger.error('Failed to parse user header JSON.', e.stack);
      }
    } else {
      logger.warn('User header is missing or malformed.');
    }
    return {
      getUser: () => user,
      getTenantId: () => user?.tenantId ?? null,
      getUserId: () => user?.id ?? null,
    };
  },
  inject: [REQUEST],
};