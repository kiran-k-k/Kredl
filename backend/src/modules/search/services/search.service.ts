import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from '../../courses/schemas/course.schema';
import { CourseModule } from '../../modules/schemas/module.schema';
import { Lesson } from '../../lessons/schemas/lesson.schema';
import { Company } from '../../companies/schemas/company.schema';
import { JobRole } from '../../job-roles/schemas/job-role.schema';
import { Job } from '../../jobs/schemas/job.schema';
import { GlobalSearchQueryDto } from '../dto/global-search-query.dto';
import { MongoQueryBuilder } from '../../../common/utils/mongo-query.builder';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(CourseModule.name) private readonly moduleModel: Model<CourseModule>,
    @InjectModel(Lesson.name) private readonly lessonModel: Model<Lesson>,
    @InjectModel(Company.name) private readonly companyModel: Model<Company>,
    @InjectModel(JobRole.name) private readonly roleModel: Model<JobRole>,
    @InjectModel(Job.name) private readonly jobModel: Model<Job>,
  ) {}

  // Basic regex sanitizer to prevent ReDoS
  private sanitizeSearchString(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async globalSearch(query: GlobalSearchQueryDto) {
    if (query.search) {
      query.search = this.sanitizeSearchString(query.search);
    }

    const requestedTypes = query.type && query.type.length > 0 
      ? query.type 
      : ['course', 'module', 'lesson', 'company', 'role', 'job'];

    // For Relevance sorting fallback, if requested, we'll sort by 'createdAt' desc internally
    // as true relevance requires Text indexing scoring which isn't used uniformly here for partial matches.
    // However, if sortBy='relevance' is passed, we'll map it to 'createdAt' to prevent errors.
    const originalSortBy = query.sortBy;
    if (query.sortBy === 'relevance') {
      query.sortBy = 'createdAt';
      query.sortOrder = 'desc';
    }

    const searchPromises: Promise<any>[] = [];

    // Course Search
    if (requestedTypes.includes('course')) {
      const builder = new MongoQueryBuilder<Course>(this.courseModel, query);
      searchPromises.push(
        builder.paginate(['title', 'shortDescription', 'description', 'tags']).then(res => ({ courses: res }))
      );
    } else {
      searchPromises.push(Promise.resolve({ courses: { data: [], pagination: null } }));
    }

    // Module Search
    if (requestedTypes.includes('module')) {
      const builder = new MongoQueryBuilder<CourseModule>(this.moduleModel, query);
      searchPromises.push(
        builder.paginate(['title', 'description']).then(res => ({ modules: res }))
      );
    } else {
      searchPromises.push(Promise.resolve({ modules: { data: [], pagination: null } }));
    }

    // Lesson Search
    if (requestedTypes.includes('lesson')) {
      const builder = new MongoQueryBuilder<Lesson>(this.lessonModel, query);
      searchPromises.push(
        builder.paginate(['title', 'description', 'learningObjectives', 'keyPoints']).then(res => ({ lessons: res }))
      );
    } else {
      searchPromises.push(Promise.resolve({ lessons: { data: [], pagination: null } }));
    }

    // Company Search
    if (requestedTypes.includes('company')) {
      const builder = new MongoQueryBuilder<Company>(this.companyModel, query);
      searchPromises.push(
        builder.paginate(['name', 'overview', 'industry']).then(res => ({ companies: res }))
      );
    } else {
      searchPromises.push(Promise.resolve({ companies: { data: [], pagination: null } }));
    }

    // Role Search
    if (requestedTypes.includes('role')) {
      const builder = new MongoQueryBuilder<JobRole>(this.roleModel, query);
      searchPromises.push(
        builder.paginate(['title', 'shortDescription', 'description']).then(res => ({ jobRoles: res }))
      );
    } else {
      searchPromises.push(Promise.resolve({ jobRoles: { data: [], pagination: null } }));
    }

    // Job Search
    if (requestedTypes.includes('job')) {
      const builder = new MongoQueryBuilder<Job>(this.jobModel, query);
      searchPromises.push(
        builder.paginate(['title', 'jobSummary', 'location', 'searchKeywords']).then(res => ({ jobs: res }))
      );
    } else {
      searchPromises.push(Promise.resolve({ jobs: { data: [], pagination: null } }));
    }

    const resultsArray = await Promise.all(searchPromises);
    
    // Merge array of objects into a single result object
    const results = resultsArray.reduce((acc, curr) => ({ ...acc, ...curr }), {});

    // Calculate total results
    const totalResults = Object.values(results).reduce((total: number, entityTypeResult: any) => {
      return total + (entityTypeResult.pagination?.total || 0);
    }, 0);

    // If relevance sort was originally requested, we can apply an application-level sort
    // to boost exact matches in titles. But to maintain pagination integrity, this is complex across 
    // separate paginated collections. For MVP, we stick to the database sort we mapped.

    // Restore original query for response consistency
    query.sortBy = originalSortBy;

    return {
      query: query.search || '',
      filters: { type: requestedTypes },
      totalResults,
      ...results,
    };
  }
}
