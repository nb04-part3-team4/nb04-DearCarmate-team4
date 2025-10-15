import { uploadImage } from '@/shared/middlewares/cloudinary.js';
import { PostImage } from './images.schema.js';

class ImageService {
  async postImage({ path }: PostImage) {
    const { imageUrl } = await uploadImage(path);
    return { imageUrl };
  }
}

export default new ImageService();
