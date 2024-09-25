# 경량화된 Node.js alpine 이미지 사용
FROM node:alpine


# 작업 디렉토리 설정
WORKDIR /usr/src/app

# 모든 소스코드를 복사
COPY . .

RUN npm install

RUN npm run build

# 애플리케이션을 외부로 노출할 포트 설정
EXPOSE 80

# 프로덕션 모드로 애플리케이션 실행

CMD [ "node", "dist/main.js" ]