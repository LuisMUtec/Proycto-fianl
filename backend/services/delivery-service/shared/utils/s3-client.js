/**
 * S3 Client
 * 
 * ⚠️ SEGURIDAD:
 * - NO incluye credenciales
 * - Usa IAM Role de Lambda
 * - Compatible con AWS Academy
 */

const AWS = require('aws-sdk');

// Cliente S3 usa IAM Role automáticamente
const s3 = new AWS.S3({
  region: process.env.REGION || process.env.AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'fridays-product-images';

/**
 * Subir archivo a S3
 * 
 * @param {string} key - Key del objeto en S3 (path/filename)
 * @param {Buffer} body - Contenido del archivo
 * @param {string} contentType - Tipo MIME
 * @returns {Promise<string>} - URL del objeto
 */
async function uploadFile(key, body, contentType = 'image/jpeg') {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
      ACL: 'public-read' // o 'private' según política
    };

    await s3.putObject(params).promise();
    
    const url = `https://${BUCKET_NAME}.s3.${process.env.REGION || process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    console.log(`✅ File uploaded to S3: ${key}`);
    return url;
  } catch (error) {
    console.error(`❌ S3 uploadFile error:`, error.message);
    throw error;
  }
}

/**
 * Obtener archivo de S3
 */
async function getFile(key) {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key
    };

    const result = await s3.getObject(params).promise();
    return result.Body;
  } catch (error) {
    console.error(`❌ S3 getFile error:`, error.message);
    throw error;
  }
}

/**
 * Eliminar archivo de S3
 */
async function deleteFile(key) {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key
    };

    await s3.deleteObject(params).promise();
    console.log(`✅ File deleted from S3: ${key}`);
  } catch (error) {
    console.error(`❌ S3 deleteFile error:`, error.message);
    throw error;
  }
}

/**
 * Generar URL pre-firmada para upload
 */
async function getSignedUploadUrl(key, contentType = 'image/jpeg', expiresIn = 300) {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      Expires: expiresIn
    };

    const url = await s3.getSignedUrlPromise('putObject', params);
    console.log(`✅ Signed upload URL generated: ${key}`);
    return url;
  } catch (error) {
    console.error('❌ S3 getSignedUploadUrl error:', error.message);
    throw error;
  }
}

/**
 * Generar URL pre-firmada para download
 */
async function getSignedDownloadUrl(key, expiresIn = 300) {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Expires: expiresIn
    };

    const url = await s3.getSignedUrlPromise('getObject', params);
    return url;
  } catch (error) {
    console.error('❌ S3 getSignedDownloadUrl error:', error.message);
    throw error;
  }
}

/**
 * Listar objetos con prefijo
 */
async function listFiles(prefix = '') {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Prefix: prefix
    };

    const result = await s3.listObjectsV2(params).promise();
    return result.Contents || [];
  } catch (error) {
    console.error('❌ S3 listFiles error:', error.message);
    throw error;
  }
}

module.exports = {
  uploadFile,
  getFile,
  deleteFile,
  getSignedUploadUrl,
  getSignedDownloadUrl,
  listFiles
};
