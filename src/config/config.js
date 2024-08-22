//환경 변수 설정
require('dotenv').config();

module.exports = {
  googleCloudKeyFile: process.env.GOOGLE_CLOUD_KEYFILE,
  bucketName: process.env.BUCKET_NAME,
};
