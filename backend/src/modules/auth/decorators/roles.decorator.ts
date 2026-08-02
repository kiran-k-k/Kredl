import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from '../../roles/schemas/role.schema';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleEnum[]) => SetMetadata(ROLES_KEY, roles);
