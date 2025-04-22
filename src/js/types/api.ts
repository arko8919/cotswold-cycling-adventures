export interface LoginResponse {
  status: string;
  token?: string;
  data?: {
    user: object;
  };
}

export interface CheckoutSessionResponse {
  status: 'success';
  session: {
    id: string;
  };
}
