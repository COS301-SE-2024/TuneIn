import AWS from 'aws-sdk';

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const _AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_NEST_BUCKET_NAME = "tunein-nest-bucket";
const AWS_S3_REGION = process.env.AWS_S3_REGION;
const AWS_S3_ENDPOINT = process.env.AWS_S3_ENDPOINT;
const AWS_SECRET_ACCESS_KEY: string = _AWS_SECRET_ACCESS_KEY.replace('+', '+')
console.log(AWS_SECRET_ACCESS_KEY);

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
