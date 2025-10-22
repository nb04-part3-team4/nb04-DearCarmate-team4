import { RequestHandler } from 'express';
import ImageService from '@/features/images/images.service.js';

class ImageController {
  postImageRequest: RequestHandler = async (req, res, next) => {
    try {
      const result = await ImageService.postImageRequest();
      console.log('presigned url 요청');
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  };
  postImage: RequestHandler = async (req, res, next) => {
    try {
      const result = await ImageService.postImage(req.body);
      console.log('cloudinary web hook 수신');
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  };
}

export default new ImageController();
