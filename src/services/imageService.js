const express = require('express');
const sharp = require('sharp');
const { Storage } = require('@google-cloud/storage');
const vision = require('@google-cloud/vision');

const app = express();
app.use(express.json());

const storage = new Storage();
const client = new vision.ImageAnnotatorClient();

const bucketName = 'your-bucket-name';

// 이미지 합성 및 스타일 적용 함수
async function mergeAndStyleImages(
  userImagePath,
  providerImagePath,
  outputImagePath,
  style
) {
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

    const faceX = faceBounds[0].x;
    const faceY = faceBounds[0].y;
    const faceWidth = faceBounds[2].x - faceX;
    const faceHeight = faceBounds[2].y - faceY;

    // 사용자 얼굴 이미지를 처리하고 스타일 적용
    let faceBuffer = await sharp(userImagePath)
      .extract({
        left: faceX,
        top: faceY,
        width: faceWidth,
        height: faceHeight,
      })
      .resize({ width: faceWidth, height: faceHeight });

    // 스타일 적용
    switch (style) {
      case 'grayscale':
        faceBuffer = faceBuffer.grayscale();
        break;
      case 'sepia':
        faceBuffer = faceBuffer.modulate({
          brightness: 1,
          saturation: 0.3,
          hue: 30,
        });
        break;
      case 'blur':
        faceBuffer = faceBuffer.blur(5);
        break;
      default:
        // 기본 스타일 적용하지 않음
        break;
    }

    faceBuffer = await faceBuffer.toBuffer();

    // 업체 이미지 불러오기 및 합성
    await sharp(providerImagePath)
      .composite([{ input: faceBuffer, top: faceY, left: faceX }])
      .toFile(outputImagePath);

    // 합성된 이미지 Cloud Storage에 업로드
    await storage.bucket(bucketName).upload(outputImagePath, {
      destination: outputImagePath,
    });

    return `https://storage.googleapis.com/${bucketName}/${outputImagePath}`;
  } catch (error) {
    console.error('Error during image processing:', error);
    throw error;
  }
}
