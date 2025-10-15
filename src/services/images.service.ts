import { uploadImage } from '@/middlewares/cloudinary.js';
import { PostImage } from '../types/images.schema.js';

class ImageService {
  async postImage({ path }: PostImage) {
    const { imageUrl } = await uploadImage(path);
    return { imageUrl };
  }
}

export default new ImageService();
