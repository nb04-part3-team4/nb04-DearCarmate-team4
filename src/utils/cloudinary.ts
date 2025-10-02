import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { InternalServerError } from '@/utils/custom-error.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(path: string) {
  const { secure_url } = await cloudinary.uploader.upload(path, {
    folder: 'team4_images',
  });
  fs.unlinkSync(path);
  console.log('Cloudinary에 이미지 업로드 완료');
  return { imageUrl: secure_url };
}

export function extractPublicIdFromCloudinaryUrl(imageUrl: string) {
  const parts = imageUrl.split('/upload/');
  if (parts.length > 1) {
    const pathWithVersion = parts[1];
    const publicIdWithExtension = pathWithVersion.split('/').slice(1).join('/');
    return publicIdWithExtension.substring( 0, publicIdWithExtension.lastIndexOf('.')); // prettier-ignore
  }
  return null;
}

export function deletionList(imageUrls: string[]) {
  return imageUrls.map(async (imageUrl) => {
    const publicId = extractPublicIdFromCloudinaryUrl(imageUrl);
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
        console.log(`Cloudinary에서 이미지 ${publicId} 삭제 성공`);
      } catch (err) {
        if (err instanceof Error) {
          // 타입 가드
          throw new InternalServerError(
            `Cloudinary에서 이미지 ${publicId} 삭제 실패: ${err.message}`,
          );
        }
        throw new InternalServerError(
          `Cloudinary에서 이미지 ${publicId} 삭제 중 알 수 없는 에러 발생: ${String(err)}`,
        );
      }
    }
  });
}

export async function deletionSingle(imageUrl: string) {
  const publicId = extractPublicIdFromCloudinaryUrl(imageUrl);
  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
      console.log(`Cloudinary에서 이미지 ${publicId} 삭제 성공`);
    } catch (err) {
      if (err instanceof Error) {
        // 타입 가드
        throw new InternalServerError(
          `Cloudinary에서 이미지 ${publicId} 삭제 실패: ${err.message}`,
        );
      }
      throw new InternalServerError(
        `Cloudinary에서 이미지 ${publicId} 삭제 중 알 수 없는 에러 발생: ${String(err)}`,
      );
    }
  }
}
