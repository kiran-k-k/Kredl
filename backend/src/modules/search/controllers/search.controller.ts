import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchService } from '../services/search.service';
import { GlobalSearchQueryDto } from '../dto/global-search-query.dto';

@ApiTags('Global Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Perform a global search across multiple entities' })
  @ApiResponse({
    status: 200,
    description: 'Returns grouped search results with pagination',
  })
  globalSearch(@Query() query: GlobalSearchQueryDto) {
    return this.searchService.globalSearch(query);
  }
}
