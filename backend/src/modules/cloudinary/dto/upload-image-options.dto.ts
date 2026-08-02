export interface UploadImageOptions {
  folder: string;
  width?: number;
  height?: number;
  crop?: string;
  overwrite?: boolean;
  invalidate?: boolean;
  quality?: string | number;
  format?: string;
  tags?: string[];
  context?: Record<string, string>;
}
