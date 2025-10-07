import { RequestHandler } from 'express';
import ImageService from '@/services/images.service.js';
import { imageSchema } from '../types/images.schema.js';

class ImageController {
  postImage: RequestHandler = async (req, res, next) => {
    try {
      const { path } = imageSchema.parse(req.file);
      const result = await ImageService.postImage({ path });
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  };
}

export default new ImageController();
