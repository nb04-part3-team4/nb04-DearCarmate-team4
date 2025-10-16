#!/usr/bin/env tsx
/**
 * Cloudinary 연결 테스트 스크립트
 *
 * 사용법:
 *   npx tsx scripts/test-cloudinary.ts
 */

import { v2 as cloudinary } from 'cloudinary';
import { promises as fs } from 'fs';
import path from 'path';

// .env 파일 로드 함수
async function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  try {
    const envContent = await fs.readFile(envPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // 따옴표 제거
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    });
  } catch (error) {
    console.error('⚠️  .env 파일 로드 실패:', error);
  }
}

async function testCloudinaryConnection() {
  // .env 파일 로드
  await loadEnv();

  // Cloudinary 설정
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  });
  console.log('🔍 Cloudinary 연결 테스트 시작...\n');

  // 1. 환경 변수 확인
  console.log('📋 환경 변수 확인:');
  console.log(
    `  - CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME ? '✅ 설정됨' : '❌ 없음'}`,
  );
  console.log(
    `  - CLOUDINARY_API_KEY: ${process.env.CLOUDINARY_API_KEY ? '✅ 설정됨' : '❌ 없음'}`,
  );
  console.log(
    `  - CLOUDINARY_API_SECRET: ${process.env.CLOUDINARY_API_SECRET ? '✅ 설정됨' : '❌ 없음'}`,
  );
  console.log();

  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    console.error('❌ Cloudinary 환경 변수가 설정되지 않았습니다.');
    console.log('💡 .env 파일을 확인해주세요.');
    process.exit(1);
  }

  try {
    // 2. API 연결 테스트 (ping)
    console.log('🔌 Cloudinary API 연결 테스트...');
    const pingResult = await cloudinary.api.ping();
    console.log(`  ✅ API 연결 성공: ${pingResult.status}\n`);

    // 3. 테스트 이미지 생성
    console.log('🖼️  테스트 이미지 생성...');
    const tempDir = path.join(process.cwd(), 'temp-cloudinary-test');
    await fs.mkdir(tempDir, { recursive: true });

    const testImagePath = path.join(tempDir, 'test-upload.png');

    // 1x1 red pixel PNG (base64)
    const redPixelPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
      'base64',
    );

    await fs.writeFile(testImagePath, redPixelPng);
    console.log(`  ✅ 테스트 이미지 생성됨: ${testImagePath}\n`);

    // 4. 이미지 업로드 테스트
    console.log('⬆️  이미지 업로드 테스트...');
    const uploadResult = await cloudinary.uploader.upload(testImagePath, {
      folder: 'team4_images',
      public_id: `test_${Date.now()}`,
      resource_type: 'image',
    });

    console.log(`  ✅ 업로드 성공!`);
    console.log(`     - URL: ${uploadResult.secure_url}`);
    console.log(`     - Public ID: ${uploadResult.public_id}`);
    console.log(`     - Format: ${uploadResult.format}`);
    console.log(`     - Size: ${(uploadResult.bytes / 1024).toFixed(2)} KB\n`);

    // 5. 이미지 삭제 테스트
    console.log('🗑️  이미지 삭제 테스트...');
    const deleteResult = await cloudinary.uploader.destroy(
      uploadResult.public_id,
      {
        resource_type: 'image',
      },
    );

    if (deleteResult.result === 'ok') {
      console.log(`  ✅ 삭제 성공!\n`);
    } else {
      console.log(`  ⚠️  삭제 결과: ${deleteResult.result}\n`);
    }

    // 6. 임시 파일 정리
    console.log('🧹 임시 파일 정리...');
    await fs.rm(tempDir, { recursive: true, force: true });
    console.log(`  ✅ 정리 완료\n`);

    // 7. 계정 정보 조회
    console.log('📊 Cloudinary 계정 정보:');
    try {
      const resources = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'team4_images/',
        max_results: 10,
      });
      console.log(
        `  - team4_images 폴더 이미지 개수: ${resources.resources.length}개`,
      );
      console.log(`  - 총 리소스: ${resources.total_count}개\n`);
    } catch (error: any) {
      console.log(`  ⚠️  계정 정보 조회 실패: ${error.message}\n`);
    }

    console.log('✅ 모든 테스트 성공! Cloudinary가 정상적으로 작동합니다.\n');
  } catch (error: any) {
    console.error('\n❌ 테스트 실패:', error.message);

    if (error.http_code === 401) {
      console.log('\n💡 인증 실패: API 키와 시크릿을 확인해주세요.');
    } else if (error.http_code === 404) {
      console.log('\n💡 리소스를 찾을 수 없습니다: Cloud Name을 확인해주세요.');
    } else {
      console.log('\n💡 자세한 에러:', error);
    }

    process.exit(1);
  }
}

// 스크립트 실행
testCloudinaryConnection().catch((error) => {
  console.error('❌ 예상치 못한 에러:', error);
  process.exit(1);
});
