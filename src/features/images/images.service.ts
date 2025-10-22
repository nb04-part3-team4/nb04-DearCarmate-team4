import { generateUploadSignature } from '@/shared/middlewares/cloudinary.js';

interface CloudinaryNotification {
  notification_type: string;
  resource_type: string;
  public_id: string;
  secure_url: string;
}

class ImageService {
  async postImageRequest() {
    const signatureData = generateUploadSignature();
    return signatureData;
  }
  async postImage(body: CloudinaryNotification) {
    const notification = body;

    // 서명 검증 코드 추가

    console.log('Cloudinary Webhook Received:', notification);

    // 이미지 업로드 관련 알림인지 확인
    if (
      notification.notification_type === 'upload' &&
      notification.resource_type === 'image'
    ) {
      console.log(`Image saved to: ${notification.secure_url}`);
      // db에 secure_url 저장 혹은 추가 작업
      // 현재 프로젝트처럼 프론트에서 프로필 수정 form으로 imageUrl 보내오고 db에 image 테이블 따로 없는 경우
      // 백엔드에서는 업로드 확인만 수행
      return 'web hooks success';
    }
    return 'web hooks fail';
  }
}

export default new ImageService();
