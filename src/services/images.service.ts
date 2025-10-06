import { uploadImage } from '@/utils/cloudinary.js';
import { PostImage } from '../types/images.type.js';

class ImageService {
  async postImage({ path }: PostImage) {
    const { imageUrl } = await uploadImage(path);
    return { imageUrl };
  }
}

export default new ImageService();
