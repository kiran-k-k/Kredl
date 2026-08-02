/**
 * SlugService — shared slug generation for the Kredl platform.
 *
 * Centralises all `slugify` usage so individual services never import or
 * configure the library directly.  Provides both a synchronous `generate()`
 * helper and an async `generateUnique()` that uses a caller-supplied
 * existence predicate to ensure uniqueness within a collection.
 */

import { Injectable, BadRequestException } from '@nestjs/common';
import slugify from 'slugify';

@Injectable()
export class SlugService {
  private static readonly SLUGIFY_OPTIONS = {
    lower: true,
    strict: true, // strips non-alphanumeric chars, replaces spaces with -
    trim: true,
  } as const;

  /** Maximum number of suffix-append attempts before giving up. */
  private static readonly MAX_ATTEMPTS = 5;

  /**
   * Converts `text` to a URL-safe lowercase slug.
   *
   * @example
   * generate('Introduction to React') // => 'introduction-to-react'
   */
  generate(text: string): string {
    return slugify(text, SlugService.SLUGIFY_OPTIONS);
  }

  /**
   * Generates a slug from `title` that is guaranteed to be unique according
   * to `existsFn`.  On each collision a 5-character random alphanumeric
   * suffix is appended.  Throws `BadRequestException` after
   * `MAX_ATTEMPTS` consecutive collisions.
   *
   * @param title     - Source text for the slug.
   * @param existsFn  - Async predicate returning `true` when the slug is
   *                    already taken in the target collection/scope.
   *
   * @example
   * const slug = await slugService.generateUnique(
   *   course.title,
   *   (s) => this.courseModel.exists({ slug: s }),
   * );
   */
  async generateUnique(
    title: string,
    existsFn: (slug: string) => Promise<boolean>,
  ): Promise<string> {
    const base = this.generate(title);
    let candidate = base;

    for (let attempt = 0; attempt < SlugService.MAX_ATTEMPTS; attempt++) {
      if (!(await existsFn(candidate))) {
        return candidate;
      }
      candidate = `${base}-${this.randomSuffix()}`;
    }

    throw new BadRequestException(
      `Could not generate a unique slug for "${title}" after ` +
        `${SlugService.MAX_ATTEMPTS} attempts. ` +
        'Please provide an explicit slug.',
    );
  }

  /** Returns a 5-character alphanumeric random string. */
  private randomSuffix(): string {
    return Math.random().toString(36).slice(2, 7);
  }
}
