import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { BadRequestError } from './custom-error.js';

// uploads 디렉토리 확인 및 생성
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
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
    cb(new BadRequestError('jpg, png 파일만 업로드 가능합니다.'));
  }
};

const csvFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (file.mimetype === 'text/csv') {
    cb(null, true);
  } else {
    cb(new BadRequestError('잘못된 요청입니다'));
  }
};

export const uploadImage = multer({ storage, fileFilter });

export const uploadCsv = multer({
  storage: multer.memoryStorage(),
  fileFilter: csvFilter,
});
