# My Project : 운동기록 서비스
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Runtime-Node.js-green?logo=node.js)
![NestJS](https://img.shields.io/badge/Framework-NestJS-red?logo=nestjs)
![TypeORM](https://img.shields.io/badge/ORM-TypeORM-yellow?logo=typeorm)
![MySQL](https://img.shields.io/badge/Database-MySQL-orange?logo=mysql)
![Redis](https://img.shields.io/badge/Cache-Redis-red?logo=redis)
![GitHub Actions](https://img.shields.io/badge/CI/CD-GitHub%20Actions-blue?logo=githubactions)
![Docker](https://img.shields.io/badge/Container-Docker-blue?logo=docker)
![AWS ECR](https://img.shields.io/badge/Registry-AWS%20ECR-orange?logo=amazonaws)
![AWS EC2](https://img.shields.io/badge/Deployment-AWS%20EC2-yellow?logo=amazonaws)


## 프로젝트의 목적
- 헬스장에서 운동한 내용을 기록할 수 있는 서비스 구현
- Front-end 는 ChatGPT를 이용하여 구현
- CI/CD 를 이용하여 배포 자동화 구현
  - GitHub Actions 
  - Docker container image
  - AWS ECR 
- MySQL 성능 최적화해보기
  - 멀티 컬럼 인덱스
  - 반정규화
  - Redis
 
## 구현한 기능 목록

### 1. 운동 일지 관리
- 여러 운동 기록을 한번에 저장/수정/삭제 하는 기능
- 기록된 각 운동이름 마다 최대 기록을 낸 유저를 찾아 내는 기능

### 2. 루틴 관리
- 루틴을 저장/수정/삭제 하는 기능
- 유저가 기록한 루틴을 검색 및 호출하는 기능

### 3. 운동 이름 관리
- 몸의 부위별 운동 이름을 등록/수정/삭제 하는 기능


### 3. 사용자 계정 관리
- 회원가입/로그인
  - jwt token 이용
 

## 데이터베이스 ERD
![ERD  설명] (gymLog-erd.png)

## Stack
### **Development**
- **Language**: TypeScript
- **Runtime**: Node.js
- **Framework**: NestJS
- **Database**: MySQL, Redis
- **ORM**: TypeORM

### **Infrastructure**
- **Cloud**: AWS EC2
- **CI/CD**: 
  - GitHub Actions (Workflow Automation)
  - Docker (Containerization)
  - AWS ECR (Container Registry)


