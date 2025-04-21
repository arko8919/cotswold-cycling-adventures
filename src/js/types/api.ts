export interface LoginResponse {
  status: string;
  token?: string;
  data?: {
    user: object;
  };
}
