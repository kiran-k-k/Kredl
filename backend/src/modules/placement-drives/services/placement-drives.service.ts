import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PlacementDrive } from '../schemas/placement-drive.schema';
import { CreatePlacementDriveDto } from '../dto/create-placement-drive.dto';
import { UpdatePlacementDriveDto } from '../dto/update-placement-drive.dto';
import { AdminQueryDto } from '../../../common/dto/admin-query.dto';
import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';
import { MongoQueryBuilder } from '../../../common/utils/mongo-query.builder';
import { User, UserStatus } from '../../users/schemas/user.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PlacementDrivesService {
  constructor(
    @InjectModel(PlacementDrive.name)
    private readonly driveModel: Model<PlacementDrive>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createDto: CreatePlacementDriveDto): Promise<PlacementDrive> {
    const createdDrive = new this.driveModel(createDto);
    const drive = await createdDrive.save();

    this.eventEmitter.emit('placement-drive.published', {
      driveId: drive._id.toString(),
      title: drive.title,
    });

    return drive;
  }

  async findAll(query: AdminQueryDto): Promise<PaginatedResult<PlacementDrive>> {
    const builder = new MongoQueryBuilder<PlacementDrive>(this.driveModel, query);
    return builder.paginate(['title']);
  }

  async findOne(id: string): Promise<PlacementDrive> {
    const drive = await this.driveModel.findById(id).exec();
    if (!drive) {
      throw new NotFoundException(`Placement Drive #${id} not found`);
    }
    return drive;
  }

  async update(id: string, updateDto: UpdatePlacementDriveDto): Promise<PlacementDrive> {
    const drive = await this.driveModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();

    if (!drive) {
      throw new NotFoundException(`Placement Drive #${id} not found`);
    }
    return drive;
  }

  async remove(id: string): Promise<void> {
    const drive = await this.driveModel.findByIdAndDelete(id).exec();
    if (!drive) {
      throw new NotFoundException(`Placement Drive #${id} not found`);
    }
  }

  async getEligibleStudents(id: string): Promise<User[]> {
    const drive = await this.findOne(id);
    const criteria = drive.eligibilityCriteria;

    const filter: any = { status: UserStatus.ACTIVE };

    if (criteria.allowedBranches && criteria.allowedBranches.length > 0) {
      filter.department = { $in: criteria.allowedBranches };
    }

    if (criteria.batchYears && criteria.batchYears.length > 0) {
      filter.graduationYear = { $in: criteria.batchYears };
    }

    // We can filter by CGPA if the User schema tracks it. Currently User schema doesn't have cgpa.
    // So we'll skip CGPA filter for the DB query and return the matched students.
    // In a real system, we'd either add CGPA to User schema or an AcademicProfile schema.

    return this.userModel.find(filter).select('-passwordHash').exec();
  }
}
