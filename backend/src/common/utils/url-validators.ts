/**
 * Shared URL validation utilities for the Kredl platform.
 *
 * Centralises regex constants and guard functions so that individual
 * services never contain ad-hoc validation logic.  Pure functions
 * with no side-effects — easily tree-shaken and trivially testable.
 */

import { BadRequestException } from '@nestjs/common';

// ---------------------------------------------------------------------------
// GitHub
// ---------------------------------------------------------------------------

/**
 * Accepts:
 *   https://github.com/<owner>/<repo>
 *   https://github.com/<owner>/<repo>.git
 *   https://github.com/<owner>/<repo>/tree/main   (sub-paths allowed)
 *
 * Requires HTTPS; rejects http://, gitlab, bitbucket, etc.
 */
export const GITHUB_REPO_REGEX =
  /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+(\.git)?(\/.*)?$/;

/**
 * Throws a 400 `BadRequestException` when `url` is a non-empty string
 * that does not match `GITHUB_REPO_REGEX`.  Safe to call with `undefined`
 * or an empty string — those are treated as "not provided" and ignored.
 */
export function assertGithubUrl(url: string | undefined): void {
  if (url && !GITHUB_REPO_REGEX.test(url)) {
    throw new BadRequestException(
      `Invalid GitHub repository URL: "${url}". ` +
        'Expected format: https://github.com/<owner>/<repository>',
    );
  }
}

// ---------------------------------------------------------------------------
// YouTube
// ---------------------------------------------------------------------------

/**
 * Accepts all common YouTube URL forms:
 *   https://www.youtube.com/watch?v=<id>
 *   https://youtube.com/embed/<id>
 *   https://youtube.com/shorts/<id>
 *   https://youtu.be/<id>
 *
 * Video IDs are exactly 11 characters from the YouTube-safe alphabet.
 * Optional query-string / fragment allowed after the ID.
 */
export const YOUTUBE_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]{11}([&?#][^\s]*)?$/;

/**
 * Throws a 400 `BadRequestException` when `url` is a non-empty string
 * that does not match `YOUTUBE_REGEX`.  Safe to call with `undefined`.
 */
export function assertYoutubeUrl(url: string | undefined): void {
  if (url && !YOUTUBE_REGEX.test(url)) {
    throw new BadRequestException(
      `Invalid YouTube URL: "${url}". ` +
        'Accepted formats: youtube.com/watch?v=..., ' +
        'youtube.com/embed/..., youtube.com/shorts/..., youtu.be/...',
    );
  }
}
