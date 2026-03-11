import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import databaseService from '../config/database';
import { getJwtExpiresIn, getJwtSecret } from '../config/security';

const JWT_SECRET = getJwtSecret();
const JWT_EXPIRES_IN = getJwtExpiresIn();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MINUTES = 15;

export interface CoordinatorLogin {
  LoginID: number;
  CoordinatorID: number;
  Email: string;
  PasswordHash: string;
  FirstName: string;
  LastName: string;
  IsActive: boolean;
  LastLoginAt: Date | null;
  FailedLoginAttempts: number;
  LockedUntil: Date | null;
  PasswordResetToken: string | null;
  PasswordResetExpires: Date | null;
  CreatedAt: Date;
  UpdatedAt: Date;
}

export interface LoginResult {
  success: boolean;
  message: string;
  token?: string;
  coordinator?: {
    coordinatorId: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface TokenPayload {
  loginId: number;
  coordinatorId: number;
  email: string;
  coordinatorName: string;
  type: 'coordinator';
}

export class CoordinatorAuthService {
  async findByEmail(email: string): Promise<CoordinatorLogin | null> {
    const query = `
      SELECT 
        LoginID,
        CoordinatorID,
        Email,
        PasswordHash,
        FirstName,
        LastName,
        IsActive,
        LastLoginAt,
        FailedLoginAttempts,
        LockedUntil,
        CreatedAt,
        UpdatedAt
      FROM CoordinatorLogins
      WHERE Email = @email AND IsActive = 1
    `;
    const result = await databaseService.executeQuery<CoordinatorLogin>(query, { email });
    return result.length > 0 ? result[0] as CoordinatorLogin : null;
  }

  async updateLastLogin(loginId: number): Promise<void> {
    const query = `
      UPDATE CoordinatorLogins 
      SET LastLoginAt = GETDATE(), 
          FailedLoginAttempts = 0,
          LockedUntil = NULL,
          UpdatedAt = GETDATE()
      WHERE LoginID = @loginId
    `;
    await databaseService.executeQuery(query, { loginId });
  }

  async incrementFailedAttempts(loginId: number): Promise<number> {
    const query = `
      UPDATE CoordinatorLogins 
      SET FailedLoginAttempts = FailedLoginAttempts + 1,
          UpdatedAt = GETDATE()
      OUTPUT INSERTED.FailedLoginAttempts
      WHERE LoginID = @loginId
    `;
    const result = await databaseService.executeQuery<{ FailedLoginAttempts: number }>(query, { loginId });
    return result[0]?.FailedLoginAttempts || 0;
  }

  async lockAccount(loginId: number, lockUntil: Date): Promise<void> {
    const query = `
      UPDATE CoordinatorLogins 
      SET LockedUntil = @lockUntil,
          UpdatedAt = GETDATE()
      WHERE LoginID = @loginId
    `;
    await databaseService.executeQuery(query, { loginId, lockUntil });
  }

  async login(email: string, password: string): Promise<LoginResult> {
    // Find coordinator by email
    const coordinatorLogin = await this.findByEmail(email.toLowerCase().trim());

    if (!coordinatorLogin) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    // Check if account is locked
    if (coordinatorLogin.LockedUntil && new Date(coordinatorLogin.LockedUntil) > new Date()) {
      const minutesRemaining = Math.ceil(
        (new Date(coordinatorLogin.LockedUntil).getTime() - Date.now()) / 60000
      );
      return {
        success: false,
        message: `Account is locked. Please try again in ${minutesRemaining} minutes.`
      };
    }

    // Check if account is active
    if (!coordinatorLogin.IsActive) {
      return {
        success: false,
        message: 'Account is deactivated. Please contact support.'
      };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, coordinatorLogin.PasswordHash);

    if (!isPasswordValid) {
      // Increment failed attempts
      const failedAttempts = await this.incrementFailedAttempts(coordinatorLogin.LoginID);

      // Lock account if too many failed attempts
      if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockUntil = new Date(Date.now() + LOCK_TIME_MINUTES * 60000);
        await this.lockAccount(coordinatorLogin.LoginID, lockUntil);
        return {
          success: false,
          message: `Too many failed login attempts. Account locked for ${LOCK_TIME_MINUTES} minutes.`
        };
      }

      return {
        success: false,
        message: `Invalid email or password. ${MAX_LOGIN_ATTEMPTS - failedAttempts} attempts remaining.`
      };
    }

    // Update last login timestamp
    await this.updateLastLogin(coordinatorLogin.LoginID);

    // Generate JWT token
    const tokenPayload: TokenPayload = {
      loginId: coordinatorLogin.LoginID,
      coordinatorId: coordinatorLogin.CoordinatorID,
      email: coordinatorLogin.Email,
      coordinatorName: `${coordinatorLogin.FirstName} ${coordinatorLogin.LastName}`,
      type: 'coordinator'
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    } as jwt.SignOptions);

    return {
      success: true,
      message: 'Login successful',
      token,
      coordinator: {
        coordinatorId: coordinatorLogin.CoordinatorID,
        email: coordinatorLogin.Email,
        firstName: coordinatorLogin.FirstName,
        lastName: coordinatorLogin.LastName
      }
    };
  }

  verifyToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      if (decoded.type !== 'coordinator') {
        return null;
      }
      return decoded;
    } catch {
      return null;
    }
  }
}

export const coordinatorAuthService = new CoordinatorAuthService();
