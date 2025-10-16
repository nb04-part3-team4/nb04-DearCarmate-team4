import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  uploadImage,
  extractPublicIdFromCloudinaryUrl,
  deletionSingle,
  deletionSingleByPublicId,
  deletionList,
  deletionListByPublicIds,
} from '@/shared/middlewares/cloudinary';
import { promises as fs } from 'fs';
import path from 'path';

describe('Cloudinary Integration Tests', () => {
  let testImagePath: string;

  beforeAll(async () => {
    // Create a test image file (1x1 red pixel PNG)
    const testDir = path.join(process.cwd(), 'storage/temp');
    await fs.mkdir(testDir, { recursive: true });

    testImagePath = path.join(testDir, 'test-image.png');

    // Base64 encoded 1x1 red pixel PNG
    const redPixelPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
      'base64',
    );

    await fs.writeFile(testImagePath, redPixelPng);
  });

  afterAll(async () => {
    // Clean up test directory
    const testDir = path.join(process.cwd(), 'storage/temp');
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Failed to clean up test directory:', error);
    }
  });

  describe('uploadImage', () => {
    it('should upload an image to Cloudinary', async () => {
      // Create a copy of test image for upload (since uploadImage deletes the file)
      const uploadPath = testImagePath.replace('.png', '-upload.png');
      await fs.copyFile(testImagePath, uploadPath);

      const result = await uploadImage(uploadPath);

      expect(result).toHaveProperty('imageUrl');
      expect(result).toHaveProperty('publicId');
      expect(result).toHaveProperty('format');
      expect(result.imageUrl).toContain('cloudinary.com');
      expect(result.imageUrl).toContain('team4_images');
      expect(result.format).toBe('png');

      // Save for later tests
      // uploadedImageUrl = result.imageUrl;
      // uploadedPublicId = result.publicId;

      // Verify the file was deleted after upload
      await expect(fs.access(uploadPath)).rejects.toThrow();
    });

    it('should throw error for non-existent file', async () => {
      const nonExistentPath = '/path/to/non/existent/file.png';

      await expect(uploadImage(nonExistentPath)).rejects.toThrow();
    });
  });

  describe('extractPublicIdFromCloudinaryUrl', () => {
    it('should extract public_id from Cloudinary URL', () => {
      const testUrl =
        'https://res.cloudinary.com/demo/image/upload/v1234567890/team4_images/test.png';
      const publicId = extractPublicIdFromCloudinaryUrl(testUrl);

      expect(publicId).toBe('team4_images/test');
    });

    it('should extract public_id from URL with transformations', () => {
      const testUrl =
        'https://res.cloudinary.com/demo/image/upload/v1234567890/c_fill,w_200/team4_images/test.jpg';
      const publicId = extractPublicIdFromCloudinaryUrl(testUrl);

      expect(publicId).toBe('team4_images/test');
    });

    it('should return null for invalid URL', () => {
      const invalidUrl = 'https://example.com/image.png';
      const publicId = extractPublicIdFromCloudinaryUrl(invalidUrl);

      expect(publicId).toBeNull();
    });

    it('should handle URLs without version number', () => {
      const testUrl =
        'https://res.cloudinary.com/demo/image/upload/team4_images/test.png';
      const publicId = extractPublicIdFromCloudinaryUrl(testUrl);

      expect(publicId).toBe('team4_images/test');
    });
  });

  describe('deletionSingle', () => {
    it('should delete an image by URL', async () => {
      // Upload a test image first
      const uploadPath = testImagePath.replace('.png', '-delete-test.png');
      await fs.copyFile(testImagePath, uploadPath);
      const { imageUrl } = await uploadImage(uploadPath);

      // Delete it
      await expect(deletionSingle(imageUrl)).resolves.not.toThrow();
    });

    it('should not throw error for non-existent image URL', async () => {
      const fakeUrl =
        'https://res.cloudinary.com/demo/image/upload/team4_images/non-existent.png';

      // Cloudinary doesn't throw error for non-existent images
      await expect(deletionSingle(fakeUrl)).resolves.not.toThrow();
    });

    it('should handle URL without public_id gracefully', async () => {
      const invalidUrl = 'https://example.com/image.png';

      // Should return early without throwing
      await expect(deletionSingle(invalidUrl)).resolves.not.toThrow();
    });
  });

  describe('deletionSingleByPublicId', () => {
    it('should delete an image by public_id', async () => {
      // Upload a test image first
      const uploadPath = testImagePath.replace('.png', '-delete-by-id.png');
      await fs.copyFile(testImagePath, uploadPath);
      const { publicId } = await uploadImage(uploadPath);

      // Delete it
      await expect(deletionSingleByPublicId(publicId)).resolves.not.toThrow();
    });
  });

  describe('deletionList', () => {
    it('should delete multiple images by URLs', async () => {
      // Upload test images
      const uploadPath1 = testImagePath.replace('.png', '-batch-1.png');
      const uploadPath2 = testImagePath.replace('.png', '-batch-2.png');

      await fs.copyFile(testImagePath, uploadPath1);
      await fs.copyFile(testImagePath, uploadPath2);

      const result1 = await uploadImage(uploadPath1);
      const result2 = await uploadImage(uploadPath2);

      const imageUrls = [result1.imageUrl, result2.imageUrl];

      // Delete them
      await expect(deletionList(imageUrls)).resolves.not.toThrow();
    });

    it('should handle empty array', async () => {
      await expect(deletionList([])).resolves.not.toThrow();
    });
  });

  describe('deletionListByPublicIds', () => {
    it('should delete multiple images by public_ids', async () => {
      // Upload test images
      const uploadPath1 = testImagePath.replace('.png', '-batch-id-1.png');
      const uploadPath2 = testImagePath.replace('.png', '-batch-id-2.png');

      await fs.copyFile(testImagePath, uploadPath1);
      await fs.copyFile(testImagePath, uploadPath2);

      const result1 = await uploadImage(uploadPath1);
      const result2 = await uploadImage(uploadPath2);

      const publicIds = [result1.publicId, result2.publicId];

      // Delete them
      await expect(deletionListByPublicIds(publicIds)).resolves.not.toThrow();
    });

    it('should handle empty array', async () => {
      await expect(deletionListByPublicIds([])).resolves.not.toThrow();
    });
  });

  describe('Full workflow', () => {
    it('should upload, retrieve public_id, and delete', async () => {
      // 1. Upload
      const uploadPath = testImagePath.replace('.png', '-workflow.png');
      await fs.copyFile(testImagePath, uploadPath);
      const uploadResult = await uploadImage(uploadPath);

      expect(uploadResult.imageUrl).toBeTruthy();
      expect(uploadResult.publicId).toBeTruthy();

      // 2. Extract public_id from URL
      const extractedPublicId = extractPublicIdFromCloudinaryUrl(
        uploadResult.imageUrl,
      );
      expect(extractedPublicId).toBe(uploadResult.publicId);

      // 3. Delete by URL
      await deletionSingle(uploadResult.imageUrl);

      // Success if no error thrown
    });
  });
});
