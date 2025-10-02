import express from 'express';
import ImageController from '@/controllers/images-controller';
import upload from '@/utils/multer.js';

const imageRouter = express.Router();

imageRouter
  .route('/upload')
  .post(upload.single('image'), ImageController.postImage);

export default imageRouter;
