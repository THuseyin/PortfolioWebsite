import type { Readable } from 'node:stream';

export const MEDIA_STORAGE = Symbol('MEDIA_STORAGE');

export const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export interface UploadedImage {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

export interface StoredImage {
  filename: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface OpenedImage {
  stream: Readable;
  mimeType: string;
}

export interface MediaStorage {
  saveImage(file: UploadedImage): Promise<StoredImage>;
  openImage?(filename: string): Promise<OpenedImage>;
}
