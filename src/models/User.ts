export interface User {
    UserID: number;
    Email: string;
    PasswordHash: string;
    UserType: 'Student' | 'Coordinator' | 'Partner' | 'Admin';
    FirstName: string;
    LastName: string;
    ProfilePictureURL?: string;
    IsActive: boolean;
    IsEmailVerified: boolean;
    LastLoginDate?: Date;
    CreatedAt: Date;
    UpdatedAt: Date;
    // Related entity IDs
    StudentID?: number;
    CoordinatorID?: number;
    PartnerID?: number;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    user?: {
        UserID: number;
        Email: string;
        UserType: string;
        FirstName: string;
        LastName: string;
        ProfilePictureURL?: string;
        StudentID?: number;
        CoordinatorID?: number;
        PartnerID?: number;
    };
    token?: string;
    expiresIn?: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    userType: 'Student' | 'Coordinator' | 'Partner' | 'Admin';
    studentID?: number;
    coordinatorID?: number;
    partnerID?: number;
}

export interface AuthTokenPayload {
    userID: number;
    email: string;
    userType: string;
    firstName: string;
    lastName: string;
    studentID?: number;
    coordinatorID?: number;
    partnerID?: number;
}

export interface PasswordResetRequest {
    email: string;
}

export interface PasswordResetConfirm {
    token: string;
    newPassword: string;
    confirmPassword: string;
}
