import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument, RoleEnum } from './schemas/role.schema';

@Injectable()
export class RolesService implements OnModuleInit {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectModel(Role.name)
    private roleModel: Model<RoleDocument>,
  ) {}

  async onModuleInit() {
    await this.initializeDefaultRoles();
  }

  private async initializeDefaultRoles() {
    const roles = [
      { name: RoleEnum.STUDENT, permissions: ['READ_COURSES', 'APPLY_JOBS'] },
      {
        name: RoleEnum.TPO,
        permissions: ['CREATE_DRIVES', 'CREATE_ANNOUNCEMENTS'],
      },
      { name: RoleEnum.ADMIN, permissions: ['ALL_PERMISSIONS'] },
    ];

    for (const roleData of roles) {
      const exists = await this.roleModel
        .findOne({ name: roleData.name })
        .exec();
      if (!exists) {
        await this.roleModel.create(roleData);
        this.logger.log(`Created default role: ${roleData.name}`);
      }
    }
  }

  async findByName(name: RoleEnum): Promise<RoleDocument | null> {
    return this.roleModel.findOne({ name }).exec();
  }

  async findById(id: string): Promise<RoleDocument | null> {
    return this.roleModel.findById(id).exec();
  }
}
