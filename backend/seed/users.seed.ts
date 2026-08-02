import { INestApplicationContext } from '@nestjs/common';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserStatus } from '../src/modules/users/schemas/user.schema';
import { Role } from '../src/modules/roles/schemas/role.schema';
import { RoleEnum } from '../src/modules/roles/schemas/role.schema';
import { PasswordService } from '../src/modules/auth/services/password.service';
import { runSeeder } from './utils';

export async function seedUsers(app: INestApplicationContext) {
  await runSeeder('Users', async () => {
    const userModel = app.get<Model<any>>(getModelToken(User.name));
    const roleModel = app.get<Model<any>>(getModelToken(Role.name));
    const passwordService = app.get(PasswordService);

    const roles = {
      ADMIN: await roleModel.findOne({ name: RoleEnum.ADMIN }),
      TPO: await roleModel.findOne({ name: RoleEnum.TPO }),
      STUDENT: await roleModel.findOne({ name: RoleEnum.STUDENT }),
    };

    if (!roles.ADMIN || !roles.TPO || !roles.STUDENT) {
      throw new Error('Roles not found. Run seedRoles first.');
    }

    const usersToSeed = [
      {
        email: 'admin@kredl.dev',
        firstName: 'System',
        lastName: 'Admin',
        password: 'Admin@123',
        roleId: roles.ADMIN._id,
      },
      {
        email: 'tpo@kredl.dev',
        firstName: 'Placement',
        lastName: 'Officer',
        password: 'TPO@123',
        roleId: roles.TPO._id,
      },
      {
        email: 'student@kredl.dev',
        firstName: 'Demo',
        lastName: 'Student',
        password: 'Student@123',
        roleId: roles.STUDENT._id,
      },
    ];

    for (const userData of usersToSeed) {
      const existing = await userModel.findOne({ email: userData.email });
      if (!existing) {
        const passwordHash = await passwordService.hashPassword(userData.password);
        await userModel.create({
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          passwordHash: passwordHash,
          roleId: userData.roleId,
          isEmailVerified: true,
          status: UserStatus.ACTIVE,
        });
      } else {
         const passwordHash = await passwordService.hashPassword(userData.password);
         await userModel.updateOne({ _id: existing._id }, { 
             $set: { passwordHash: passwordHash, roleId: userData.roleId, status: UserStatus.ACTIVE } 
         });
      }
    }
  });
}
