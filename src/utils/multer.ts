import multer from 'multer';

export const uploadImage = multer({ dest: 'uploads/' });

export const uploadCsv = multer({ storage: multer.memoryStorage() });
