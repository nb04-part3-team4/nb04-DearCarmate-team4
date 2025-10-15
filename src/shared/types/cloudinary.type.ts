/**
 * Cloudinary 관련 타입 정의
 * Single Source of Truth for Cloudinary types
 */

export interface UploadResult {
  imageUrl: string;
  publicId: string;
  format: string;
}

export interface CloudinaryConfig {
  cloud_name: string;
  api_key: string;
  api_secret: string;
}
