const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
require("dotenv").config();

const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
  },
});

async function getObjectUrl(key) {
  const command = new GetObjectCommand({
    Bucket: "client-bucket-backend",
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command);
  // console.log(url);
  return url;
}

async function uploadObject(filename, fileData, contentType) {
  try {
    const command = new PutObjectCommand({
      Bucket: "client-bucket-backend",
      Key: `client/upload/${filename}`,
      Body: fileData,
      ContentType: contentType,
    });

    const fileUploadedData = await s3Client.send(command);

    if (fileUploadedData.$metadata.httpStatusCode == 200) {
      return {
        fileUploadedData: fileUploadedData,
        key: `client/upload/${filename}`,
      };
    }
  } catch (error) {
    return error.message;
  }
}

module.exports = { getObjectUrl, uploadObject };
