import { Injectable } from '@nestjs/common';
import { Ability, AbilityBuilder, AbilityClass, ExtractSubjectType, InferSubjects } from '@casl/ability';
import { JwtPayload } from '../auth/types';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

// Define the subjects that can be managed by this service
export type Subjects = InferSubjects<'Project' | 'Task' | 'all'>;
export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: JwtPayload) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(Ability as AbilityClass<AppAbility>);

    if (user.roles.includes('admin')) {
      can(Action.Manage, 'all'); 
    }

    if (user.roles.includes('project_manager')) {
      can(Action.Manage, 'Project'); 
      can(Action.Manage, 'Task');
    }
    
    can(Action.Read, 'Project');
    can(Action.Read, 'Task');

    return build({
      // FIX: Cast 'item' to 'any' to bypass the type-checking issue with .constructor
      detectSubjectType: (item) => (item as any)?.constructor as ExtractSubjectType<Subjects>,
    });
  }
}