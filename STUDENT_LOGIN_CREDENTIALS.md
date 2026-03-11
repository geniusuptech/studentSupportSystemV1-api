# Student Login Credentials

## Endpoint
`POST /api/students/auth/login`

## Password Format
Student passwords are generated with this format:

`GUPS{First2Letters}{SurnameInitial}{NNN}`

Example:
- Student name: `Lerato Khumalo`
- Generated password: `GUPSLEK001`

## Generate / Reset Student Credentials
Run:

```bash
node setup-student-logins.js
```

The script prints each student's email + generated password.

## Notes
- These credentials are for the `StudentLogins` table and `/api/students/auth/login`.
- Users-table credentials for `/api/auth/login` are generated separately:

```bash
npm run setup:users-auth
```
