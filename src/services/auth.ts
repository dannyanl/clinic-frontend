import { api } from "./api";
import type { AuthTokens, User } from "../types";

export async function login(
  email: string,
  password: string,
  totp_code?: string
): Promise<AuthTokens> {
  const payload: Record<string, string> = { email, password };
  if (totp_code) payload.totp_code = totp_code;
  const { data } = await api.post<AuthTokens>("/auth/login", payload);
  return data;
}

export async function register(payload: {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  dni?: string;
  birth_date?: string;
  role?: string;
}): Promise<AuthTokens> {
  const { data } = await api.post<AuthTokens>("/auth/register", payload);
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>("/auth/me");
  return data;
}

export async function updateMe(
  userId: number,
  payload: { full_name?: string; phone?: string }
): Promise<User> {
  const { data } = await api.patch<User>(`/users/${userId}`, payload);
  return data;
}

export async function changePassword(payload: {
  current_password: string;
  new_password: string;
}): Promise<void> {
  await api.post("/auth/password/change", payload);
}
