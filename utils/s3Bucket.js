const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: "AKIA47CRUQV56EVGDBN6",
    secretAccessKey: "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",
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
