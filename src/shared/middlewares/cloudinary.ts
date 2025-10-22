/**
 * Cloudinary 이미지 관리 유틸리티
 * Responsibility: Cloudinary API와의 통신 및 이미지 업로드/삭제 처리
 */

import { v2 as cloudinary } from 'cloudinary';
import { promises as fs } from 'fs';
import { InternalServerError } from '@/shared/middlewares/custom-error';
import { UploadResult } from '@/shared/types/cloudinary.type';

// Cloudinary 초기 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const CLOUDINARY_FOLDER = 'team4_images';

export function generateUploadSignature() {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign = { timestamp: timestamp, folder: CLOUDINARY_FOLDER };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!,
    );

    return {
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY!,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
      folder: paramsToSign.folder,
    };
  } catch (error) {
    console.error('Cloudinary 서명 생성 실패:', error);
    throw new InternalServerError('이미지 업로드 준비 중 오류가 발생했습니다.');
  }
}

/**
 * 로컬 이미지를 Cloudinary에 업로드
 * @param localPath 업로드할 로컬 이미지 경로
 * @returns 업로드된 이미지 정보
 */
export async function uploadImage(localPath: string): Promise<UploadResult> {
  try {
    const res = await cloudinary.uploader.upload(localPath, {
      folder: CLOUDINARY_FOLDER,
      resource_type: 'image',
    });

    return {
      imageUrl: res.secure_url,
      publicId: res.public_id,
      format: res.format ?? '',
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    throw new InternalServerError(`Cloudinary 업로드 실패: ${errorMessage}`);
  } finally {
    // 업로드 성공/실패 여부와 관계없이 로컬 파일 삭제
    try {
      await fs.unlink(localPath);
    } catch {
      // 파일 삭제 실패는 무시
    }
  }
}

/**
 * Cloudinary URL에서 public_id 추출
 * @param imageUrl Cloudinary 이미지 URL
 * @returns public_id 또는 null
 * @example
 * extractPublicIdFromCloudinaryUrl('https://res.cloudinary.com/<cloud>/image/upload/v1712345678/team4_images/a.b.c.png')
 * // returns 'team4_images/a.b.c'
 */
export function extractPublicIdFromCloudinaryUrl(
  imageUrl: string,
): string | null {
  try {
    const pivot = '/upload/';
    const uploadIndex = imageUrl.indexOf(pivot);

    if (uploadIndex === -1) {
      return null;
    }

    let tail = imageUrl.slice(uploadIndex + pivot.length);
    const segments = tail.split('/');

    // v123456 형태의 버전 번호 제거
    if (segments[0].startsWith('v') && /^\d+$/.test(segments[0].slice(1))) {
      segments.shift();
    }

    // 변환 파라미터 제거 (예: c_fill,w_200 등)
    while (
      segments.length &&
      /[,_]/.test(segments[0]) &&
      !segments[0].includes('.')
    ) {
      segments.shift();
    }

    const joined = segments.join('/');
    const lastDotIndex = joined.lastIndexOf('.');

    return lastDotIndex > -1 ? joined.slice(0, lastDotIndex) : joined;
  } catch {
    return null;
  }
}

/**
 * 단일 이미지를 URL로 삭제
 * @param imageUrl Cloudinary 이미지 URL
 */
export async function deletionSingle(imageUrl: string): Promise<void> {
  const publicId = extractPublicIdFromCloudinaryUrl(imageUrl);

  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    throw new InternalServerError(
      `Cloudinary에서 이미지 ${publicId} 삭제 실패: ${errorMessage}`,
    );
  }
}

/**
 * 단일 이미지를 public_id로 삭제
 * @param publicId Cloudinary public_id
 */
export async function deletionSingleByPublicId(
  publicId: string,
): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    throw new InternalServerError(
      `Cloudinary에서 이미지 ${publicId} 삭제 실패: ${errorMessage}`,
    );
  }
}

/**
 * 여러 이미지를 URL 배열로 일괄 삭제
 * @param imageUrls Cloudinary 이미지 URL 배열
 */
export async function deletionList(imageUrls: string[]): Promise<void> {
  try {
    await Promise.all(
      imageUrls.map(async (imageUrl) => {
        const publicId = extractPublicIdFromCloudinaryUrl(imageUrl);
        if (!publicId) {
          return;
        }
        await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
      }),
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    throw new InternalServerError(`Cloudinary 일괄 삭제 실패: ${errorMessage}`);
  }
}

/**
 * 여러 이미지를 public_id 배열로 일괄 삭제
 * @param publicIds Cloudinary public_id 배열
 */
export async function deletionListByPublicIds(
  publicIds: string[],
): Promise<void> {
  try {
    await Promise.all(
      publicIds.map((id) =>
        cloudinary.uploader.destroy(id, { resource_type: 'image' }),
      ),
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    throw new InternalServerError(`Cloudinary 일괄 삭제 실패: ${errorMessage}`);
  }
}
