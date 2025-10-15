import express from 'express';
import ImageController from '@/features/images/images.controller';
import { uploadImage } from '@/shared/middlewares/multer.js';

const imageRouter = express.Router();

imageRouter
  .route('/upload')
  .post(uploadImage.single('image'), ImageController.postImage);

export default imageRouter;
