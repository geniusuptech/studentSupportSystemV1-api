export interface User {
    id: string;
    email: string;
    passwordHash: string;
    role: 'student' | 'partner' | 'coordinator' | 'admin';
    firstName: string;
    lastName: string;
    profilePictureUrl?: string;
    isActive: boolean;
    isEmailVerified: boolean;
    lastLoginAt?: string;
    createdAt: string;
    updatedAt: string;
    // Related entity IDs
    studentId?: string;
    coordinatorId?: string;
    partnerId?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    user?: {
        id: string;
        email: string;
        type: string;
        firstName: string;
        lastName: string;
        profilePictureUrl?: string;
        studentId?: string;
        coordinatorId?: string;
        partnerId?: string;
    };
    token?: string;
    refreshToken?: string;
    expiresIn?: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    userType: 'student' | 'partner' | 'coordinator';
    studentID?: string;
    coordinatorID?: string;
    partnerID?: string;
}

export interface AuthTokenPayload {
    userID: string;
    email: string;
    userType: string;
    firstName: string;
    lastName: string;
    studentID?: string;
    coordinatorID?: string;
    partnerID?: string;
    exp?: number;
    [key: string]: any;
}

export interface PasswordResetRequest {
    email: string;
}

export interface PasswordResetConfirm {
    token: string;
    newPassword: string;
    confirmPassword: string;
}