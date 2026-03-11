import bcrypt from 'bcryptjs';
import databaseService from './src/config/database';

type UserType = 'Student' | 'Coordinator' | 'Partner' | 'Admin';

interface UserRow {
  UserID: number;
  Email: string;
  UserType: UserType;
  FirstName: string;
  LastName: string;
}

interface CredentialRow {
  userId: number;
  email: string;
  userType: UserType;
  password: string;
}

function sanitizeName(value: string): string {
  return value.replace(/[^a-zA-Z]/g, '').toUpperCase();
}

function buildPassword(user: UserRow, counters: Record<UserType, number>): string {
  const first = sanitizeName(user.FirstName || '').padEnd(2, 'X').slice(0, 2);
  const last = sanitizeName(user.LastName || '').padEnd(1, 'X').slice(0, 1);

  const prefixMap: Record<UserType, string> = {
    Student: 'GUPS',
    Coordinator: 'GUPC',
    Partner: 'GUPP',
    Admin: 'GUPA'
  };

  counters[user.UserType] += 1;
  const count = String(counters[user.UserType]).padStart(3, '0');

  return `${prefixMap[user.UserType]}${first}${last}${count}`;
}

async function setupUsersAuth(): Promise<void> {
  try {
    await databaseService.connect();

    const users = await databaseService.executeQuery<UserRow>(
      `
      SELECT UserID, Email, UserType, FirstName, LastName
      FROM Users
      WHERE IsActive = 1
      ORDER BY UserType, FirstName, LastName, UserID
      `
    );

    if (users.length === 0) {
      console.log('No active users found in Users table.');
      return;
    }

    const counters: Record<UserType, number> = {
      Student: 0,
      Coordinator: 0,
      Partner: 0,
      Admin: 0
    };

    const credentials: CredentialRow[] = [];

    for (const user of users) {
      const password = buildPassword(user, counters);
      const passwordHash = await bcrypt.hash(password, 12);

      await databaseService.executeQuery(
        `
        UPDATE Users
        SET PasswordHash = @PasswordHash,
            UpdatedAt = GETDATE()
        WHERE UserID = @UserID
        `,
        {
          PasswordHash: passwordHash,
          UserID: user.UserID
        }
      );

      credentials.push({
        userId: user.UserID,
        email: user.Email,
        userType: user.UserType,
        password
      });
    }

    console.log('\nUsers auth credentials refreshed');
    console.log('Format by role:');
    console.log('  Student: GUPS{First2}{Last1}{NNN}');
    console.log('  Coordinator: GUPC{First2}{Last1}{NNN}');
    console.log('  Partner: GUPP{First2}{Last1}{NNN}');
    console.log('  Admin: GUPA{First2}{Last1}{NNN}\n');

    for (const row of credentials) {
      console.log(
        `[${row.userType}] UserID=${row.userId} Email=${row.email} Password=${row.password}`
      );
    }
  } finally {
    await databaseService.disconnect();
  }
}

setupUsersAuth()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to setup user auth:', error);
    process.exit(1);
  });
