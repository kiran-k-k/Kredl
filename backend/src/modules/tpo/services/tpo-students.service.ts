import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserStatus } from '../../users/schemas/user.schema';
import { AdminQueryDto } from '../../../common/dto/admin-query.dto';
import { MongoQueryBuilder } from '../../../common/utils/mongo-query.builder';
import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';
import { RoleEnum } from '../../roles/schemas/role.schema';

@Injectable()
export class TpoStudentsService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findAll(query: AdminQueryDto): Promise<PaginatedResult<User>> {
    if (!query.filter) {
      query.filter = {};
    }
    // TPOs only view STUDENTS who are not deleted.
    // Ensure we don't fetch admins or other roles if we had role filtering.
    // For now we just pass it to MongoQueryBuilder.
    
    // We can merge user-provided filters (department, graduationYear, etc.)
    // If the client sends them as strings, MongoQueryBuilder handles simple equality.
    if (query.filter.graduationYear) {
      query.filter.graduationYear = Number(query.filter.graduationYear);
    }
    
    const builder = new MongoQueryBuilder<User>(this.userModel, query);
    return builder.paginate(['firstName', 'lastName', 'email']);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-passwordHash').exec();
    if (!user) throw new NotFoundException('Student not found');
    return user;
  }

  async getStudentProgress(id: string): Promise<any> {
    const user = await this.findOne(id);
    
    // TODO: Integrate with ProgressModule and PlacementReadinessModule to 
    // calculate actual readiness score based on learning progress, projects, 
    // quizzes, and profile completion.
    return {
      studentId: id,
      metrics: {
        learningProgress: null,
        projectsScore: null,
        quizScore: null,
        profileScore: user.profileCompleted ? 100 : 50,
      },
      readinessScore: null,
      status: 'Progress metrics integration pending.',
      completedModules: [],
      completedProjects: [],
      completedQuizzes: []
    };
  }
}
