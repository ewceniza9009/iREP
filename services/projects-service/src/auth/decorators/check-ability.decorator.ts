import { SetMetadata } from '@nestjs/common';
import { Action, Subjects } from '../../casl/casl-ability.factory';

export const CHECK_ABILITY = 'check_ability';

export const CheckAbilities = (...requirements: { action: Action, subject: Subjects }[]) =>
  SetMetadata(CHECK_ABILITY, requirements);