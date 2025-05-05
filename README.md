# My Project : A service to log and track your workouts

# Project Stacks

### Backend
![Node.js](https://img.shields.io/badge/Node.js-23.6.1-339933?logo=node.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-red?logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript&logoColor=white)

### Database & ORM  
![MySQL](https://img.shields.io/badge/MySQL-8.4.2-4479A1?logo=mysql&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-grey?logo=typeorm&logoColor=white)

### Cache  
![Redis](https://img.shields.io/badge/Redis-7.2.7-DC382D?logo=redis&logoColor=white) 

### Deployment & DevOps 
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-grey?logo=githubactions&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-27.4-blue?logo=docker&logoColor=white)
![AWS ECR](https://img.shields.io/badge/AWS_ECR-grey?logo=amazonwebservices&logoColor=orange)
![AWS EC2](https://img.shields.io/badge/AWS_EC2-grey?logo=amazonwebservices&logoColor=orange)
![AWS RDS](https://img.shields.io/badge/AWS_RDS-grey?logo=amazonwebservices&logoColor=orange)

### Testing 
![Jest](https://img.shields.io/badge/Jest-grey?logo=jest&logoColor=white) 

### Tools  
![WebStorm](https://img.shields.io/badge/WebStorm-2024.2.4-000000?logo=webstorm&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-grey?logo=postman&logoColor=white)

# Project Goals
- Implement a service for logging and tracking gym workout activities
- Create a fully automated CI/CD pipeline to accelerate releases and ensure consistent deployments
- Optimize MySQL performance through
  - Multi‑column indexes
  - Denormalization
  - Redis caching

# Git Flow
master: The main branch for managing release versions

develop: The integration branch where ongoing development takes place

feature: The branch used for developing new features
 

# Features
### CI/CD pipeline built with GitHub Actions, Docker, AWS ECR, and AWS EC2
<img src="./docs/ci-cd-pipeline.png" width="500px" alt="CI/CD Pipeline Diagram" />

### MySQL Performance Optimization
I evaluated three strategies:
- Multi‑column indexes, 
- Denormalization
- Redis caching
In the end, **multi‑column indexes + Redis caching** were selcted to acheieve fast query performance while preserving schema flexibilty
 
### Notable API Endpoints

Yearly Exercise Summary (workout-logs/year?)
- Retrieves a breakdown of all exercises performed by a given user in a specified year.

Monthly Exercise Summary(workout-logs/year-month?)
- Retrieves a breakdown of all exercises performed by a given user in a specified month of a specified year.

Top Lift Record Lookup (workout-logs/best)
- Finds the user and details for the heaviest recorded weight for each exercise name.



# DataBase ERD

<img src="./gymLog-erd.png" width="500px" alt="databse ERD" />

 
## Project Structure
```
├── Dockerfile
├── README.md
├── commitlint.config.js
├── gym-logs-architecture.png
├── nest-cli.json
├── package-lock.json
├── package.json
├── src
│   ├── TimeStamp.entity.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── auth
│   │   └── application
│   ├── cache
│   │   ├── radis.constant.ts
│   │   ├── redis.module.ts
│   │   └── redis.service.ts
│   ├── common
│   │   ├── Logger
│   │   ├── bodyPart.enum.ts
│   │   ├── const
│   │   ├── dto
│   │   ├── infrastructure
│   │   ├── jwtPassport
│   │   ├── jwtPassport.module.ts
│   │   ├── type
│   │   └── validation
│   ├── exercise
│   │   ├── application
│   │   ├── domain
│   │   ├── dto
│   │   ├── excercise.module.ts
│   │   ├── infrastructure
│   │   ├── presentation
│   │   └── test
│   ├── main.ts
│   ├── routine
│   │   ├── application
│   │   ├── domain
│   │   ├── dto
│   │   ├── functions
│   │   ├── infrastructure
│   │   ├── presentation
│   │   ├── routine.module.ts
│   │   └── test
│   ├── user
│   │   ├── application
│   │   ├── domain
│   │   ├── dto
│   │   ├── infrastructure
│   │   ├── presentation
│   │   ├── test
│   │   └── user.module.ts
│   └── workoutLog
│       ├── application
│       ├── domain
│       ├── dto
│       ├── infrastructure
│       ├── presentation
│       ├── test
│       └── workoutLog.module.ts
├── test
│   ├── app.e2e-spec.ts
│   ├── jest-e2e.json
│   ├── jest-layer.json
│   └── utils
│       ├── dbUtils.ts
│       ├── getMySql.TypeOrm.config.ts
│       └── userUtils.ts
├── tsconfig.build.json
└── tsconfig.json

```


