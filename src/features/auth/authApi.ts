import type { AuthUser, LoginCredentials } from "./types";

const API_BASE_URL = "http://localhost:3001";

type DbUser = AuthUser & { password: string };

export async function loginRequest(creds: LoginCredentials): Promise<AuthUser> {
  const email = creds.email.trim().toLowerCase();
  const password = creds.password;

  const res = await fetch(
    `${API_BASE_URL}/users?email=${encodeURIComponent(email)}`,
  );

  if (!res.ok) {
    throw new Error("Serverlə əlaqə qurulmadı");
  }

  const list = (await res.json()) as DbUser[];

  const found = list.find((u) => u.email.trim().toLowerCase() === email);

  if (!found) {
    throw new Error("Bu email tapılmadı");
  }
  if (found.password !== password) {
    throw new Error("Şifrə yanlışdır");
  }
  const { password: _pw, ...safeUser } = found;

  return safeUser;
}
