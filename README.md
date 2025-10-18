# Turn-Decider Backend (MVP)

## Run
- Copy .env.example to .env and fill real values.
- 
pm run dev to start (nodemon) or 
pm start.

## Env Vars
- PORT
- MONGODB_URI
- JWT_SECRET
- FIREBASE_PROJECT_ID
- FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY (use \\n for newlines)

## API
- POST /api/auth/register { name, email, password?, fcmToken }
- POST /api/auth/login { email, password?, fcmToken }
- POST /api/pair/create (auth) { userAId, userBId }
- GET /api/pair/:userId (auth)
- POST /api/consent/:pairId (auth)
- GET /api/history/:userId (auth)
