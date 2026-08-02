import { BadRequestException } from '@nestjs/common';
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { SlugService } from './slug.service';

describe('SlugService', () => {
  let service: SlugService;

  beforeEach(() => {
    service = new SlugService();
  });

  // -------------------------------------------------------------------------
  // generate()
  // -------------------------------------------------------------------------
  describe('generate()', () => {
    it('lowercases the title', () => {
      expect(service.generate('HELLO WORLD')).toBe('hello-world');
    });

    it('replaces spaces with hyphens', () => {
      expect(service.generate('Introduction to React')).toBe(
        'introduction-to-react',
      );
    });

    it('strips special characters (strict mode)', () => {
      expect(service.generate('Hello ! World!')).toBe('hello-world');
    });

    it('collapses multiple spaces / hyphens', () => {
      expect(service.generate('  Multiple   Spaces  ')).toBe('multiple-spaces');
    });

    it('handles unicode characters', () => {
      const result = service.generate('Ångström Physics');
      expect(result).toMatch(/^[a-z0-9-]+$/); // must be URL-safe
    });

    it('returns a non-empty string for a single word', () => {
      expect(service.generate('JavaScript')).toBe('javascript');
    });
  });

  // -------------------------------------------------------------------------
  // generateUnique()
  // -------------------------------------------------------------------------
  describe('generateUnique()', () => {
    it('returns the base slug when no collision', async () => {
      const existsFn = jest.fn().mockResolvedValue(false);
      const slug = await service.generateUnique('My Course', existsFn);
      expect(slug).toBe('my-course');
      expect(existsFn).toHaveBeenCalledTimes(1);
      expect(existsFn).toHaveBeenCalledWith('my-course');
    });

    it('appends a suffix on first collision and returns the unique one', async () => {
      // First call (base slug) collides, second call (suffixed) does not.
      const existsFn = jest
        .fn()
        .mockResolvedValueOnce(true)
        .mockResolvedValue(false);

      const slug = await service.generateUnique('My Course', existsFn);

      expect(existsFn).toHaveBeenCalledTimes(2);
      expect(slug).toMatch(/^my-course-[a-z0-9]{5}$/);
    });

    it('keeps trying and succeeds on the 5th attempt', async () => {
      // Collide 4 times, succeed on 5th
      const existsFn = jest
        .fn()
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValue(false);

      const slug = await service.generateUnique('My Course', existsFn);
      expect(existsFn).toHaveBeenCalledTimes(5);
      expect(slug).toMatch(/^my-course(-[a-z0-9]{5})?$/);
    });

    it('throws BadRequestException after 5 consecutive collisions', async () => {
      const existsFn = jest.fn().mockResolvedValue(true); // always taken

      await expect(
        service.generateUnique('My Course', existsFn),
      ).rejects.toThrow(BadRequestException);

      expect(existsFn).toHaveBeenCalledTimes(5);
    });

    it('error message includes the original title', async () => {
      const existsFn = jest.fn().mockResolvedValue(true);
      await expect(
        service.generateUnique('Special Title', existsFn),
      ).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining('Special Title'),
        }),
      );
    });
  });
});
