export type UserRole = 'member' | 'collector' | 'admin';

export type AuthUser = {
  id: number;
  full_name: string;
  phone_number: string;
  role: UserRole;
  status: string;
};

export type LoginResponse = {
  token: string;
  role: UserRole;
  user: AuthUser;
};
