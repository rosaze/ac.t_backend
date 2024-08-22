const vision = require('@google-cloud/vision');
const sharp = require('sharp');
const { Storage } = require('@google-cloud/storage');

const client = new vision.ImageAnnotatorClient();
const storage = new Storage();

const bucketName = 'your-bucket-name'; // Cloud Storage 버킷 이름

// 사용자 이미지와 업체 이미지를 합성하는 함수
async function mergeImages(userImagePath, providerImagePath, outputImagePath) {
  try {
    // 사용자 이미지에서 얼굴 감지
    const [result] = await client.faceDetection(userImagePath);
    const faces = result.faceAnnotations;

    if (faces.length === 0) {
      throw new Error('No faces detected');
    }

    const face = faces[0];
    const boundingPoly = face.boundingPoly;
    const faceBounds = boundingPoly.vertices;

    // 얼굴 위치 계산 (예: 왼쪽 상단 기준)
    const faceX = faceBounds[0].x;
    const faceY = faceBounds[0].y;
    const faceWidth = faceBounds[2].x - faceX;
    const faceHeight = faceBounds[2].y - faceY;

    // 업체 이미지 불러오기
    const background = sharp(providerImagePath);

    // 사용자 얼굴 이미지 크기 조정 및 위치 설정
    const faceBuffer = await sharp(userImagePath)
      .extract({
        left: faceX,
        top: faceY,
        width: faceWidth,
        height: faceHeight,
      })
      .resize({ width: faceWidth, height: faceHeight })
      .toBuffer();

    // 업체 이미지에 얼굴 합성
    await background
      .composite([{ input: faceBuffer, top: faceY, left: faceX }])
      .toFile(outputImagePath);

    // 합성된 이미지 Cloud Storage에 업로드
    await storage.bucket(bucketName).upload(outputImagePath, {
      destination: outputImagePath,
    });

    console.log(`Image uploaded to ${bucketName}/${outputImagePath}`);
  } catch (error) {
    console.error('Error during image processing:', error);
  }
}

module.exports = {
  mergeImages,
};
