import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('jpg, png 파일만 업로드 가능합니다.'));
  }
};

export const uploadImage = multer({ storage, fileFilter });

export const uploadCsv = multer({ storage: multer.memoryStorage() });
