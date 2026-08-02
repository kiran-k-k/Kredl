import { INestApplicationContext } from '@nestjs/common';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Role } from '../src/modules/roles/schemas/role.schema';
import { RoleEnum } from '../src/modules/roles/schemas/role.schema';
import { runSeeder } from './utils';

export async function seedRoles(app: INestApplicationContext) {
  await runSeeder('Roles', async () => {
    const roleModel = app.get<Model<any>>(getModelToken(Role.name));
    
    const rolesToSeed = [
      { name: RoleEnum.ADMIN, description: 'Administrator with full access' },
      { name: RoleEnum.TPO, description: 'Training and Placement Officer' },
      { name: RoleEnum.STUDENT, description: 'Student learner' },
    ];

    for (const roleData of rolesToSeed) {
      const existing = await roleModel.findOne({ name: roleData.name });
      if (!existing) {
        await roleModel.create(roleData);
      }
    }
  });
}
