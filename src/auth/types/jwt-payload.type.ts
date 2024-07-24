export type JwtPayload = {
  user_id: string;
  role?: string;
  email?: string;
  timestamp: number;
};
