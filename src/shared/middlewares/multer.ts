import multer from 'multer';

export const uploadImage = multer({ dest: 'storage/uploads/' });

export const uploadCsv = multer({ storage: multer.memoryStorage() });
