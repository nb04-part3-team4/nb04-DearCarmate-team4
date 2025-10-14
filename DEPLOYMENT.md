# 배포 가이드

## 개요
- **프론트엔드**: Vercel
- **백엔드**: Render.com
- **데이터베이스**: PostgreSQL (Render.com)

---

## 🐳 Docker 로컬 개발

### 1. Docker Compose 사용

```bash
# 환경 변수 설정
cp .env.example .env
# .env 파일을 수정하여 필요한 값 입력

# Docker 컨테이너 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f backend

# 컨테이너 중지
docker-compose down

# 볼륨까지 삭제
docker-compose down -v
```

### 2. Docker만 사용 (데이터베이스는 별도)

```bash
# Docker 이미지 빌드
docker build -t project-2-backend .

# 컨테이너 실행
docker run -p 3001:3001 \
  -e DATABASE_URL="your-database-url" \
  -e JWT_SECRET="your-jwt-secret" \
  -e CLOUDINARY_CLOUD_NAME="your-cloud-name" \
  -e CLOUDINARY_API_KEY="your-api-key" \
  -e CLOUDINARY_API_SECRET="your-api-secret" \
  -e PORT=3001 \
  project-2-backend
```

---

## 🚀 Render.com 배포

### 방법 1: render.yaml 사용 (추천)

1. **GitHub Repository 연결**
   - Render 대시보드에서 "New +" → "Blueprint" 선택
   - GitHub 저장소 연결
   - `render.yaml` 파일 자동 감지

2. **환경 변수 설정**
   - Render 대시보드에서 자동으로 설정됨
   - Cloudinary 환경 변수는 수동으로 입력 필요:
     - `CLOUDINARY_CLOUD_NAME`
     - `CLOUDINARY_API_KEY`
     - `CLOUDINARY_API_SECRET`

3. **배포**
   - "Apply" 버튼 클릭
   - 자동으로 데이터베이스와 웹 서비스 생성

### 방법 2: 수동 설정

#### 1. PostgreSQL 데이터베이스 생성

1. Render 대시보드에서 "New +" → "PostgreSQL" 선택
2. 설정:
   - Name: `project-2-db`
   - Database: `project_2`
   - User: `project_2`
   - Region: Singapore (또는 선호하는 지역)
   - Plan: Free
3. "Create Database" 클릭
4. Internal Database URL 복사

#### 2. Web Service 생성

1. "New +" → "Web Service" 선택
2. GitHub 저장소 연결
3. 설정:
   - Name: `project-2-backend`
   - Region: Singapore
   - Branch: `main`
   - Runtime: Node
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npx prisma migrate deploy && npm start`
4. 환경 변수 추가:
   ```
   NODE_ENV=production
   DATABASE_URL=[위에서 복사한 Database URL]
   JWT_SECRET=[랜덤 문자열 생성]
   CLOUDINARY_CLOUD_NAME=[Cloudinary 계정 정보]
   CLOUDINARY_API_KEY=[Cloudinary 계정 정보]
   CLOUDINARY_API_SECRET=[Cloudinary 계정 정보]
   ```
5. "Create Web Service" 클릭

#### 3. Health Check 설정

- Health Check Path: `/health`
- 자동으로 서버 상태 모니터링

---

## 🌐 Vercel 프론트엔드 배포

### 1. Vercel CLI 설치

```bash
npm install -g vercel
```

### 2. 프론트엔드 배포

```bash
cd ../frontend  # 프론트엔드 디렉토리로 이동
vercel login
vercel  # 처음 배포
vercel --prod  # 프로덕션 배포
```

### 3. 환경 변수 설정

Vercel 대시보드에서 환경 변수 추가:
```
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

---

## 📋 배포 체크리스트

### 배포 전

- [ ] `.env.example` 파일이 최신 상태인지 확인
- [ ] 모든 테스트 통과 확인 (`npm test`)
- [ ] 빌드 성공 확인 (`npm run build`)
- [ ] Prisma 마이그레이션 최신 상태 확인

### Render.com 배포 후

- [ ] 데이터베이스 연결 확인
- [ ] 마이그레이션 자동 실행 확인
- [ ] Health check 엔드포인트 확인 (`/health`)
- [ ] 환경 변수 모두 설정 확인
- [ ] API 엔드포인트 테스트

### Vercel 배포 후

- [ ] 빌드 성공 확인
- [ ] 백엔드 API 연결 확인
- [ ] 환경 변수 설정 확인

---

## 🔧 트러블슈팅

### Render.com

#### 마이그레이션 실패
```bash
# Render Shell에서 수동 실행
npx prisma migrate deploy
```

#### 빌드 실패
- `package.json`의 `engines` 필드 확인
- Node 버전 호환성 확인

#### 데이터베이스 연결 실패
- `DATABASE_URL` 환경 변수 확인
- 데이터베이스가 같은 region에 있는지 확인

### Docker

#### 컨테이너 실행 안됨
```bash
# 로그 확인
docker logs project_2_backend

# 컨테이너 재시작
docker-compose restart backend
```

#### 데이터베이스 연결 실패
```bash
# PostgreSQL 컨테이너 상태 확인
docker-compose ps
docker-compose logs postgres
```

---

## 📚 추가 리소스

- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Docker Docs](https://docs.docker.com/)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

---

## 🔐 보안 주의사항

1. **환경 변수 관리**
   - `.env` 파일은 절대 커밋하지 않기
   - 프로덕션 환경에서는 강력한 JWT_SECRET 사용

2. **데이터베이스**
   - 정기적인 백업 설정
   - 프로덕션 데이터베이스는 별도 관리

3. **API Keys**
   - Cloudinary API 키는 안전하게 보관
   - 주기적으로 키 교체

---

## 📞 문의

배포 관련 문제가 있으면 이슈를 등록해주세요.
