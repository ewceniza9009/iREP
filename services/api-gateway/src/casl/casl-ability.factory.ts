// services/api-gateway/src/casl/casl-ability.factory.ts
import { Injectable } from '@nestjs/common';
import { Ability, AbilityBuilder, AbilityClass, ExtractSubjectType, InferSubjects } from '@casl/ability';
import { JwtPayload } from '../auth/types'; // Corrected import path

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type Subjects = InferSubjects<'Property' | 'Project' | 'Task' | 'Lease' | 'Transaction' | 'all'>;
export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: JwtPayload) {
    const { can, build } = new AbilityBuilder<AppAbility>(Ability as AbilityClass<AppAbility>);

    if (user.roles.includes('admin')) {
      can(Action.Manage, 'all');
    } else {
      can(Action.Read, 'Property');
      can(Action.Read, 'Project');

      if (user.roles.includes('project_manager')) {
        can(Action.Manage, 'Project');
        can(Action.Manage, 'Task');
      }
    }

    return build({
      detectSubjectType: (item) => item as ExtractSubjectType<Subjects>,
    });
  }
}