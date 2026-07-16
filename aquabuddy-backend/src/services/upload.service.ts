import { NotFoundError, ValidationError } from '../utils/error.utils';

const ALLOWED_FIRMWARE_EXTENSIONS = ['.bin', '.hex', '.img'];
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx'];

const ALLOWED_FIRMWARE_MIMES = ['application/octet-stream', 'application/x-binary'];
const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_DOCUMENT_MIMES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const MAX_FIRMWARE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DOCUMENT_SIZE = 25 * 1024 * 1024; // 25MB

interface FileValidation {
  valid: boolean;
  error?: string;
}

const validateFile = (
  file: Express.Multer.File,
  allowedExts: string[],
  allowedMimes: string[],
  maxSize: number,
  type: string
): FileValidation => {
  const ext = '.' + file.originalname.split('.').pop()?.toLowerCase();
  if (!allowedExts.includes(ext)) {
    return { valid: false, error: `Invalid ${type} file extension: ${ext}. Allowed: ${allowedExts.join(', ')}` };
  }
  if (!allowedMimes.includes(file.mimetype)) {
    return { valid: false, error: `Invalid ${type} MIME type: ${file.mimetype}` };
  }
  if (file.size > maxSize) {
    return { valid: false, error: `${type} file too large: ${file.size} bytes. Max: ${maxSize} bytes` };
  }
  return { valid: true };
};

export const validateFirmware = (file: Express.Multer.File): FileValidation => {
  return validateFile(file, ALLOWED_FIRMWARE_EXTENSIONS, ALLOWED_FIRMWARE_MIMES, MAX_FIRMWARE_SIZE, 'firmware');
};

export const validateRobotImage = (file: Express.Multer.File): FileValidation => {
  return validateFile(file, ALLOWED_IMAGE_EXTENSIONS, ALLOWED_IMAGE_MIMES, MAX_IMAGE_SIZE, 'image');
};

export const validateServiceDocument = (file: Express.Multer.File): FileValidation => {
  return validateFile(file, ALLOWED_DOCUMENT_EXTENSIONS, ALLOWED_DOCUMENT_MIMES, MAX_DOCUMENT_SIZE, 'document');
};
