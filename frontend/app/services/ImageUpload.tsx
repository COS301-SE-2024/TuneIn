import AWS from 'aws-sdk';

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const _AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_NEST_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const AWS_S3_REGION = process.env.AWS_S3_REGION;
const AWS_S3_ENDPOINT = process.env.AWS_S3_ENDPOINT;

if (!AWS_ACCESS_KEY_ID) {
  throw new Error('No AWS access key ID (AWS_ACCESS_KEY_ID) provided in environment variables');
}

if (!_AWS_SECRET_ACCESS_KEY) {
  throw new Error('No AWS secret access key (AWS_SECRET_ACCESS_KEY) provided in environment variables');
}

if (!AWS_NEST_BUCKET_NAME) {
  throw new Error('No AWS bucket name (AWS_S3_BUCKET_NAME) provided in environment variables');
}

if (!AWS_S3_REGION) {
  throw new Error('No AWS region (AWS_S3_REGION) provided in environment variables');
}

if (!AWS_S3_ENDPOINT) {
  throw new Error('No AWS endpoint (AWS_S3_ENDPOINT) provided in environment variables');
}

const AWS_SECRET_ACCESS_KEY: string = _AWS_SECRET_ACCESS_KEY.replace('+', '+')

AWS.config.update({ 
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: AWS_S3_REGION,
});
AWS.config.logger = console

// Create an S3 instance
const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    signatureVersion: 'v4'
});

const uploadImage = async (imageURI: string, roomName: string) => {
  try {
    const response = await fetch(imageURI);
      const blob = await response.blob();
      const params = {
        Bucket: AWS_NEST_BUCKET_NAME, // replace with your bucket name
        Key: `${(new Date()).toISOString()}-${roomName.replace(' ', '-').toLowerCase()}.jpeg`, // replace with the destination key
        Body: blob,
        ContentType: blob.type
      };
      const data = await s3.upload(params)
      .promise()
      console.log('Successfully uploaded image', data.Location);
      return data.Location;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
}

export default uploadImage;
