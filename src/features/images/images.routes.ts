import express from 'express';
import ImageController from '@/features/images/images.controller';

const imageRouter = express.Router();

imageRouter.route('/upload').get(ImageController.postImageRequest);
imageRouter.route('/upload/cloudinary').post(ImageController.postImage);

export default imageRouter;
