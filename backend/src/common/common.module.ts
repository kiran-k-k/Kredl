import { Global, Module } from '@nestjs/common';
import { SlugService } from './services/slug.service';

/**
 * CommonModule — global provider of shared platform utilities.
 *
 * Marked `@Global()` so any module in the application can inject
 * `SlugService` (and future common services) without having to import
 * `CommonModule` explicitly.  Simply register it once in `AppModule`.
 */
@Global()
@Module({
  providers: [SlugService],
  exports: [SlugService],
})
export class CommonModule {}
