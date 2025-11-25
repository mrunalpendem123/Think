import path from 'path';
import fs from 'fs';

export const getFileDetails = (fileId: string) => {
  const extractedPath = path.join(
    process.cwd(),
    './uploads',
    fileId + '-extracted.json',
  );
  
  const metadataPath = path.join(
    process.cwd(),
    './uploads',
    fileId + '-metadata.json',
  );

  // Check if it's an image (has metadata.json) or document (has extracted.json)
  if (fs.existsSync(metadataPath)) {
    const parsedFile = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    return {
      name: parsedFile.title,
      fileId: fileId,
      type: parsedFile.type || 'image',
    };
  } else if (fs.existsSync(extractedPath)) {
    const parsedFile = JSON.parse(fs.readFileSync(extractedPath, 'utf8'));
    return {
      name: parsedFile.title,
      fileId: fileId,
      type: parsedFile.type || 'document',
    };
  } else {
    // Fallback if neither exists
    return {
      name: fileId,
      fileId: fileId,
      type: 'unknown',
    };
  }
};

export const isImageFile = (fileId: string): boolean => {
  const metadataPath = path.join(
    process.cwd(),
    './uploads',
    fileId + '-metadata.json',
  );
  return fs.existsSync(metadataPath);
};

export const getImagePath = (fileId: string): string | null => {
  const metadataPath = path.join(
    process.cwd(),
    './uploads',
    fileId + '-metadata.json',
  );
  
  if (fs.existsSync(metadataPath)) {
    const parsedFile = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    return parsedFile.path || null;
  }
  
  return null;
};
