# OncoSheet Flow

Click-first oncology patient entry for Google Sheets.

## Setup

```bash
npm install
cp .env.example .env.local
# Fill DATABASE_URL, Google OAuth keys, TOKEN_ENCRYPTION_KEY, SESSION_SECRET
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Generate secrets:

```bash
openssl rand -base64 32
openssl rand -base64 32
```

Google OAuth redirect URI:

```txt
http://localhost:3000/api/google/callback
```

Scopes used:

```txt
openid
email
profile
https://www.googleapis.com/auth/spreadsheets
https://www.googleapis.com/auth/drive.file
```
