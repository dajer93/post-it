const { 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand 
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');

/**
 * Generate a unique filename for S3
 * @param {string} userId - User ID
 * @param {string} fileExtension - File extension (e.g., .jpg, .png)
 * @returns {string} - Unique filename
 */
const generateUniqueFilename = (userId, fileExtension) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  return `${userId}-${timestamp}-${randomString}${fileExtension}`;
};

/**
 * Upload a profile picture to S3
 * @param {Buffer} fileBuffer - File data as buffer
 * @param {string} userId - User ID
 * @param {string} contentType - MIME type of the file
 * @returns {Promise<string>} - The URL of the uploaded file
 */
const uploadProfilePicture = async (fileBuffer, userId, contentType) => {
  try {
    const s3Client = global.s3Client;
    const bucketName = global.profileBucket;
    
    // Extract file extension from content type
    let fileExtension = '.jpg'; // Default
    if (contentType === 'image/png') fileExtension = '.png';
    if (contentType === 'image/gif') fileExtension = '.gif';
    if (contentType === 'image/jpeg') fileExtension = '.jpg';
    
    const key = `profiles/${generateUniqueFilename(userId, fileExtension)}`;
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      ACL: 'public-read' // Make the file publicly accessible
    });
    
    await s3Client.send(command);
    
    // Return the public URL
    return `https://${bucketName}.s3.amazonaws.com/${key}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload profile picture');
  }
};

/**
 * Delete a profile picture from S3
 * @param {string} imageUrl - Full URL of the image
 * @returns {Promise<void>}
 */
const deleteProfilePicture = async (imageUrl) => {
  try {
    // Only proceed if there's an image to delete
    if (!imageUrl) return;
    
    const s3Client = global.s3Client;
    const bucketName = global.profileBucket;
    
    // Extract the key from the URL
    const urlParts = imageUrl.split('.com/');
    if (urlParts.length !== 2) return;
    
    const key = urlParts[1];
    
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
    });
    
    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting from S3:', error);
    // Don't throw - we don't want to break the app if deletion fails
  }
};

/**
 * Get a presigned URL for a private file
 * For demonstration, though we're using public-read ACL
 */
const getPresignedUrl = async (key, expiresIn = 3600) => {
  const s3Client = global.s3Client;
  const bucketName = global.profileBucket;
  
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key
  });
  
  return await getSignedUrl(s3Client, command, { expiresIn });
};

module.exports = {
  uploadProfilePicture,
  deleteProfilePicture,
  getPresignedUrl
}; 