import { Model } from 'mongoose';
import { AdminQueryDto } from '../dto/admin-query.dto';
import { PaginatedResult } from '../interfaces/paginated-result.interface';

export class MongoQueryBuilder<T> {
  constructor(
    private readonly model: Model<T>,
    private readonly queryDto: AdminQueryDto,
  ) {}

  /**
   * Build filters based on search string and explicit filters
   * @param searchableFields Array of fields that should be matched against the search string
   */
  private buildFilters(searchableFields: string[] = []): Record<string, any> {
    const { search, filter } = this.queryDto;
    const query: Record<string, any> = { isDeleted: { $ne: true } };

    if (search && searchableFields.length > 0) {
      query.$or = searchableFields.map((field) => ({
        [field]: { $regex: search, $options: 'i' },
      })) as Record<string, any>[];
    }

    if (filter) {
      Object.keys(filter).forEach((key) => {
        // Basic exact match or generic filtering
        query[key] = filter[key];
      });
    }

    return query;
  }

  /**
   * Execute the query with pagination and sorting
   * @param searchableFields Fields to apply search against
   * @param populate Populates to apply to the query
   */
  async paginate(
    searchableFields: string[] = [],
    populate: string | string[] = '',
  ): Promise<PaginatedResult<T>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = this.queryDto;
    
    const skip = (page - 1) * limit;
    const filters = this.buildFilters(searchableFields);

    const [data, total] = await Promise.all([
      this.model
        .find(filters)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .populate(populate as any)
        .exec(),
      this.model.countDocuments(filters).exec(),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
