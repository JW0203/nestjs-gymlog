# 경량화된 Node.js alpine 이미지 사용
FROM node:alpine

# pm2 글로벌로 설치
RUN npm install -g pm2

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# package.json과 package-lock.json만 복사하여 의존성 설치
COPY package*.json ./

RUN npm install

# 나머지 소스코드를 복사
COPY . .

RUN npm run build

# 애플리케이션을 외부로 노출할 포트 설정
EXPOSE 3000

# 프로덕션 모드로 애플리케이션 실행
CMD [ "npm", "run", "start:prod" ]