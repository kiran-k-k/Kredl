/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { MongoExceptionFilter } from './mongo-exception.filter';

// ---------------------------------------------------------------------------
// Minimal mock of an Express Response object
// ---------------------------------------------------------------------------
function makeResponse() {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  return { status, json };
}

function makeHost(response: ReturnType<typeof makeResponse>): ArgumentsHost {
  return {
    switchToHttp: () => ({
      getResponse: () => response,
    }),
  } as unknown as ArgumentsHost;
}

function makeMongoError(
  code: number,
  keyValue?: Record<string, unknown>,
): Error {
  const err = new Error('E11000 duplicate key') as any;
  err.name = 'MongoServerError';
  err.code = code;
  err.keyValue = keyValue;
  return err;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('MongoExceptionFilter', () => {
  let filter: MongoExceptionFilter;

  beforeEach(() => {
    filter = new MongoExceptionFilter();
  });

  // -------------------------------------------------------------------------
  // Duplicate-key error (code 11000)
  // -------------------------------------------------------------------------
  describe('when code === 11000', () => {
    it('responds with 409 Conflict', () => {
      const response = makeResponse();
      const host = makeHost(response);
      filter.catch(makeMongoError(11000, { slug: 'my-course' }), host);
      expect(response.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    });

    it('includes success:false in the body', () => {
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      const response = { status, json };
      const host = makeHost(response);

      filter.catch(makeMongoError(11000, { slug: 'test' }), host);

      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
      );
    });

    it('includes the conflicting field name in conflictingFields', () => {
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      const host = makeHost({ status, json });

      filter.catch(makeMongoError(11000, { order: 2 }), host);

      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({ conflictingFields: ['order'] }),
      );
    });

    it('returns generic message when keyValue is absent', () => {
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      const host = makeHost({ status, json });

      filter.catch(makeMongoError(11000, undefined), host);

      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({ conflictingFields: [] }),
      );
      expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    });
  });

  // -------------------------------------------------------------------------
  // Other Mongo errors (not 11000)
  // -------------------------------------------------------------------------
  describe('when code !== 11000', () => {
    it('responds with 500 Internal Server Error', () => {
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      const host = makeHost({ status, json });

      filter.catch(makeMongoError(2), host);

      expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  // -------------------------------------------------------------------------
  // Non-Mongo errors (should be ignored / not handled)
  // -------------------------------------------------------------------------
  describe('when the exception is NOT a Mongo error', () => {
    it('does nothing (returns without calling response.status)', () => {
      const response = makeResponse();
      const host = makeHost(response);

      const genericError = new Error('Something else');
      filter.catch(genericError, host);

      expect(response.status).not.toHaveBeenCalled();
    });
  });
});
