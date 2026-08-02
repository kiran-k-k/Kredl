import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { SearchService } from '../services/search.service';

describe('SearchController', () => {
  let controller: SearchController;
  let service: SearchService;

  const mockSearchService = {
    globalSearch: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        {
          provide: SearchService,
          useValue: mockSearchService,
        },
      ],
    }).compile();

    controller = module.get<SearchController>(SearchController);
    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('globalSearch', () => {
    it('should call searchService.globalSearch with the provided query', async () => {
      const query = { search: 'test', page: 1, limit: 10 };
      const expectedResult = { totalResults: 1, courses: { data: [{ title: 'test' }] } };
      
      mockSearchService.globalSearch.mockResolvedValue(expectedResult);

      const result = await controller.globalSearch(query);

      expect(mockSearchService.globalSearch).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });
  });
});
