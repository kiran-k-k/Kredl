/**
 * Generic wrapper for standardized API responses across all Kredl modules.
 */
export class ApiResponseDto<T> {
  /** Indicates whether the operation was successful */
  readonly success: boolean;

  /** Human-readable message describing the result */
  readonly message: string;

  /** The actual payload returned by the endpoint */
  readonly data: T;

  /** Timestamp of when the response was generated */
  readonly timestamp: Date;
}
