import express from 'express';
import ImageController from '@/controllers/images.controller';
import { uploadImage } from '@/utils/multer.js';

const imageRouter = express.Router();

imageRouter
  .route('/upload')
  .post(uploadImage.single('image'), ImageController.postImage);

export default imageRouter;
