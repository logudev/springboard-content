const path = require('path');
const fs = require('fs');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { S3Client } = require('@aws-sdk/client-s3');

const REGION = 'ap-south-1';
const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: 'AKIASUBSTDCW5ICQTKXB',
    secretAccessKey: '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',
  },
});

// Upload file to specified bucket.
const uploadToS3Bucket = async (sourceFilePath, s3BucketPath) => {
  const sourceFileStream = fs.createReadStream(sourceFilePath);
  const uploadParams = {
    Bucket: 'springboard-content',
    Key: s3BucketPath,
    Body: sourceFileStream,
  };
  try {
    const data = await s3Client.send(new PutObjectCommand(uploadParams));
    return data; // For unit tests.
  } catch (err) {
    console.log('Error', err);
  }
};

const getUploadContentPromises = (sourceFileBasePath, s3BucketBasePath) => {
  const uploadContentPromises = [];
  const countries = fs.readdirSync(path.resolve('./', sourceFileBasePath));
  countries.forEach((country) => {
    const locales = fs.readdirSync(
      path.resolve('./', `${sourceFileBasePath}/${country}/`)
    );
    locales.forEach((locale) => {
      const sourceFilePath = `${sourceFileBasePath}/${country}/${locale}`;
      const s3BucketPath = `${s3BucketBasePath}/${country}/${locale}`;
      uploadContentPromises.push(
        uploadToS3Bucket(sourceFilePath, s3BucketPath)
      );
    });
  });
  return uploadContentPromises;
};

const prepareContentAndUpload = async () => {
  const uploadMobileContentPromises = getUploadContentPromises(
    './build-content/mobile',
    'springboard/content/mobile'
  );
  const uploadWebContentPromises = getUploadContentPromises(
    './build-content/web',
    'springboard/content/web'
  );
  // Parallel invoking of content upload to S3 bucket
  try {
    const uploadData = await Promise.all([
      ...uploadMobileContentPromises,
      ...uploadWebContentPromises,
    ]);
    console.log('Successfully uploaded all content files to S3 bucket');
  } catch (err) {
    console.error('Error in uploading contents to S3 bucket.');
    console.error(err.message);
  }
};

prepareContentAndUpload();
