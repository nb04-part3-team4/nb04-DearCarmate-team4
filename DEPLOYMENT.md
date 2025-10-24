# 배포 가이드

## 개요
- **프론트엔드**: Vercel (네이티브 Next.js 빌드)
- **백엔드**: Render.com (Docker)
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

## 🚀 Render.com 배포 (Docker)

### 방법 1: render.yaml 사용 (추천)

1. **GitHub Repository 연결**
   - Render 대시보드에서 "New +" → "Blueprint" 선택
   - GitHub 저장소 연결
   - `render.yaml` 파일 자동 감지
   - **Docker runtime**으로 자동 설정됨

2. **환경 변수 설정**
   - Render 대시보드에서 자동으로 설정됨
   - 다음 환경 변수는 수동으로 입력 필요:
     - `CLOUDINARY_CLOUD_NAME`
     - `CLOUDINARY_API_KEY`
     - `CLOUDINARY_API_SECRET`
     - `GOOGLE_CLIENT_ID` (선택사항)

3. **배포**
   - "Apply" 버튼 클릭
   - 자동으로 데이터베이스와 웹 서비스 생성
   - Docker 이미지 빌드 및 배포 시작

### 방법 2: 수동 Docker 배포

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

#### 2. Docker Web Service 생성

1. "New +" → "Web Service" 선택
2. GitHub 저장소 연결
3. 설정:
   - Name: `project-2-backend`
   - Region: Singapore
   - Branch: `main`
   - **Runtime: Docker** ⚠️
   - Root Directory: `project_2-back-end` (모노레포인 경우)
   - Dockerfile Path: `./Dockerfile`
4. 환경 변수 추가:
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=[위에서 복사한 Database URL]
   JWT_SECRET=[랜덤 문자열 생성]
   CLOUDINARY_CLOUD_NAME=[Cloudinary 계정 정보]
   CLOUDINARY_API_KEY=[Cloudinary 계정 정보]
   CLOUDINARY_API_SECRET=[Cloudinary 계정 정보]
   GOOGLE_CLIENT_ID=[Google OAuth 클라이언트 ID]
   ```
5. "Create Web Service" 클릭

#### 3. Health Check 설정

- Health Check Path: `/health`
- 자동으로 서버 상태 모니터링

---

## 🌐 Vercel 프론트엔드 배포 (네이티브 Next.js)

### 방법 1: Vercel Dashboard 사용 (추천)

1. **Vercel 계정 로그인**
   - [vercel.com](https://vercel.com) 접속
   - GitHub 계정으로 로그인

2. **프로젝트 Import**
   - "Add New..." → "Project" 클릭
   - GitHub 저장소 선택
   - Root Directory: `project_2-front-end` 설정 (모노레포인 경우)
   - Framework Preset: **Next.js** (자동 감지됨)

3. **환경 변수 설정**
   - "Environment Variables" 섹션에서 추가:
   ```
   NEXT_PUBLIC_BASE_URL=https://your-backend-url.onrender.com
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
   ```

4. **배포**
   - "Deploy" 버튼 클릭
   - 자동으로 빌드 및 배포 시작

### 방법 2: Vercel CLI 사용

1. **Vercel CLI 설치**
   ```bash
   npm install -g vercel
   ```

2. **프론트엔드 배포**
   ```bash
   cd project_2-front-end
   vercel login
   vercel  # 처음 배포 (프리뷰)
   vercel --prod  # 프로덕션 배포
   ```

3. **환경 변수 설정 (CLI)**
   ```bash
   vercel env add NEXT_PUBLIC_BASE_URL
   vercel env add NEXT_PUBLIC_GOOGLE_CLIENT_ID
   ```

### 배포 후 확인사항

- ✅ 빌드 성공 확인
- ✅ 백엔드 API 연결 테스트
- ✅ Google OAuth 작동 확인
- ✅ 이미지 업로드/표시 확인

---

## 📋 배포 체크리스트

### 📦 배포 전 준비

#### Back-end (project_2-back-end)
- [ ] `.env.example` 파일이 최신 상태인지 확인
- [ ] 모든 테스트 통과 확인 (`npm test`)
- [ ] 빌드 성공 확인 (`npm run build`)
- [ ] Prisma 마이그레이션 최신 상태 확인
- [ ] Docker 이미지 로컬 빌드 테스트 (`docker build -t test-backend .`)
- [ ] `Dockerfile`과 `.dockerignore` 최신 상태 확인

#### Front-end (project_2-front-end)
- [ ] `.env.example` 파일 생성 확인
- [ ] 빌드 성공 확인 (`npm run build`)
- [ ] `vercel.json` 설정 확인
- [ ] API 엔드포인트 URL 확인

### 🚀 Render.com 배포 (Back-end)

- [ ] GitHub 저장소 연결
- [ ] PostgreSQL 데이터베이스 생성
- [ ] `render.yaml` 설정 확인 (runtime: docker)
- [ ] 환경 변수 설정:
  - [ ] `DATABASE_URL` (자동)
  - [ ] `JWT_SECRET` (자동 생성)
  - [ ] `CLOUDINARY_CLOUD_NAME`
  - [ ] `CLOUDINARY_API_KEY`
  - [ ] `CLOUDINARY_API_SECRET`
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=3001`
- [ ] Docker 빌드 성공 확인
- [ ] 마이그레이션 자동 실행 확인
- [ ] Health check 엔드포인트 확인 (`https://your-app.onrender.com/health`)
- [ ] API 엔드포인트 테스트

### 🌐 Vercel 배포 (Front-end)

- [ ] Vercel 프로젝트 생성
- [ ] Root Directory 설정 (`project_2-front-end`)
- [ ] 환경 변수 설정:
  - [ ] `NEXT_PUBLIC_BASE_URL=https://your-backend.onrender.com`
  - [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- [ ] Next.js 빌드 성공 확인
- [ ] 백엔드 API 연결 확인
- [ ] Google OAuth 로그인 테스트
- [ ] 이미지 업로드/표시 테스트
- [ ] 전체 기능 테스트

---

## 🔧 트러블슈팅

### 🐳 Render.com (Docker)

#### Docker 빌드 실패
```bash
# 로컬에서 Docker 빌드 테스트
cd project_2-back-end
docker build -t test-backend .

# 멀티스테이지 빌드 문제 확인
docker build --target builder -t test-builder .
```

#### 마이그레이션 실패
```bash
# Render Shell에서 수동 실행
npx prisma migrate deploy

# 또는 Docker 컨테이너 내부에서
docker exec -it <container-id> npx prisma migrate deploy
```

#### 환경 변수 문제
- Render 대시보드에서 모든 환경 변수 확인
- `DATABASE_URL`이 제대로 설정되었는지 확인
- Render Shell에서 확인: `echo $DATABASE_URL`

#### 데이터베이스 연결 실패
- `DATABASE_URL` 환경 변수 확인
- 데이터베이스가 같은 region에 있는지 확인
- Internal Database URL 사용 확인 (External URL 아님)

#### 포트 문제
- Render는 자동으로 `PORT` 환경 변수를 제공
- `Dockerfile`에서 `EXPOSE 3001` 확인
- 애플리케이션이 `process.env.PORT` 사용 확인

### 🌐 Vercel (Front-end)

#### 빌드 실패
```bash
# 로컬에서 프로덕션 빌드 테스트
cd project_2-front-end
npm run build
```

#### API 연결 실패
- `NEXT_PUBLIC_BASE_URL` 환경 변수 확인
- CORS 설정 확인 (백엔드)
- HTTPS 사용 확인 (Render는 자동 HTTPS 제공)

#### 환경 변수 적용 안됨
- Vercel 대시보드에서 환경 변수 재확인
- `NEXT_PUBLIC_` 접두사 확인
- 환경 변수 변경 후 재배포 필요

### 🐳 로컬 Docker 개발

#### 컨테이너 실행 안됨
```bash
# 로그 확인
docker logs project_2_backend

# 컨테이너 재시작
docker-compose restart backend

# 전체 재시작
docker-compose down && docker-compose up -d
```

#### 데이터베이스 연결 실패
```bash
# PostgreSQL 컨테이너 상태 확인
docker-compose ps
docker-compose logs postgres

# 네트워크 확인
docker network ls
docker network inspect codeit_default
```

#### 이미지 빌드 캐시 문제
```bash
# 캐시 없이 빌드
docker-compose build --no-cache

# 또는
docker build --no-cache -t project-2-backend .
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
