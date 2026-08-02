export const createQueryMock = (result: any) => {
  const query: any = {
    sort: jest.fn(() => query),
    select: jest.fn(() => query),
    skip: jest.fn(() => query),
    limit: jest.fn(() => query),
    populate: jest.fn(() => query),
    lean: jest.fn(() => {
      const promise = Promise.resolve(result) as any;
      promise.exec = jest.fn().mockResolvedValue(result);
      return promise;
    }),
    exec: jest.fn().mockResolvedValue(result),
  };
  return query;
};
