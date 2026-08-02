/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { BadRequestException } from '@nestjs/common';
import {
  assertGithubUrl,
  assertYoutubeUrl,
  GITHUB_REPO_REGEX,
  YOUTUBE_REGEX,
} from './url-validators';

// ---------------------------------------------------------------------------
// GitHub URL validator
// ---------------------------------------------------------------------------
describe('assertGithubUrl', () => {
  describe('valid URLs (should not throw)', () => {
    it.each([
      'https://github.com/owner/repo',
      'https://github.com/owner/repo.git',
      'https://github.com/owner-name/repo_name',
      'https://github.com/owner/repo/tree/main',
      'https://github.com/owner/repo/tree/feature/my-branch',
      'https://github.com/org.name/repo.name',
    ])('accepts %s', (url) => {
      expect(() => assertGithubUrl(url)).not.toThrow();
    });
  });

  describe('invalid URLs (should throw BadRequestException)', () => {
    it.each([
      'http://github.com/owner/repo', // non-HTTPS
      'https://gitlab.com/owner/repo', // wrong platform
      'https://github.com/owner', // no repo segment
      'github.com/owner/repo', // missing protocol
      'https://github.com/', // no owner or repo
      'not-a-url',
    ])('rejects %s', (url) => {
      expect(() => assertGithubUrl(url)).toThrow(BadRequestException);
    });
  });

  describe('falsy / empty values (should not throw)', () => {
    it('passes undefined through silently', () => {
      expect(() => assertGithubUrl(undefined)).not.toThrow();
    });

    it('passes empty string through silently', () => {
      expect(() => assertGithubUrl('')).not.toThrow();
    });
  });

  it('error message contains the bad URL', () => {
    const badUrl = 'http://github.com/owner/repo';
    expect(() => assertGithubUrl(badUrl)).toThrow(
      expect.objectContaining({ message: expect.stringContaining(badUrl) }),
    );
  });
});

describe('GITHUB_REPO_REGEX', () => {
  it('is exported and is a RegExp', () => {
    expect(GITHUB_REPO_REGEX).toBeInstanceOf(RegExp);
  });
});

// ---------------------------------------------------------------------------
// YouTube URL validator
// ---------------------------------------------------------------------------
describe('assertYoutubeUrl', () => {
  describe('valid URLs (should not throw)', () => {
    it.each([
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtube.com/embed/dQw4w9WgXcQ',
      'https://youtube.com/shorts/dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ',
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s',
    ])('accepts %s', (url) => {
      expect(() => assertYoutubeUrl(url)).not.toThrow();
    });
  });

  describe('invalid URLs (should throw BadRequestException)', () => {
    it.each([
      'https://vimeo.com/123456789',
      'https://dailymotion.com/video/abc',
      'https://youtube.com/watch?v=SHORT', // ID too short
      'https://youtu.be/', // no ID
      'not-a-url',
    ])('rejects %s', (url) => {
      expect(() => assertYoutubeUrl(url)).toThrow(BadRequestException);
    });
  });

  describe('falsy / empty values (should not throw)', () => {
    it('passes undefined through silently', () => {
      expect(() => assertYoutubeUrl(undefined)).not.toThrow();
    });

    it('passes empty string through silently', () => {
      expect(() => assertYoutubeUrl('')).not.toThrow();
    });
  });

  it('error message contains the bad URL', () => {
    const badUrl = 'https://vimeo.com/123456789';
    expect(() => assertYoutubeUrl(badUrl)).toThrow(
      expect.objectContaining({ message: expect.stringContaining(badUrl) }),
    );
  });
});

describe('YOUTUBE_REGEX', () => {
  it('is exported and is a RegExp', () => {
    expect(YOUTUBE_REGEX).toBeInstanceOf(RegExp);
  });
});
