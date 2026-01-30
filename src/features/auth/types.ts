export type UserRole = "admin" | "hr" | "store_manager";

export type AuthUser = {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  storeId: string | null;
};

export type LoginCredentials = {
  email: string;
  password: string;
};
