import { Adventure } from './base';

export interface User {
  email: string;
  name: string;
  passwordChangedAt: string;
  photo: string;
  role: string;
  __v: number;
  _id: string;
}

export interface LoginResponse {
  status: 'success' | 'fail' | 'error';
  token: string;
  // Note: Specify what exactly we receive from server, ( maybe use Zod package? )
  data: {
    user: User;
  };
}

export interface CheckoutSessionResponse {
  status: 'success' | 'fail' | 'error';
  session: {
    id: string;
    object: 'checkout.session';
    payment_method_types: string[];
    mode: 'payment' | 'setup' | 'subscription';
    success_url: string;
    cancel_url: string;
    customer_email: string;
    client_reference_id: string;
    line_items: Array<{
      price_data: {
        currency: string;
        product_data: {
          name: string;
          description: string;
          images: string[];
        };
        unit_amount: number;
      };
      quantity: number;
    }>;
    // Include other properties you use from the session object
  };
}

export interface UpdatedUser {
  status: 'success' | 'fail' | 'error';
  token?: string;
  data: User;
}

export interface ApiResponse<T> {
  status: 'success' | 'fail' | 'error';
  data: {
    data: T;
  };
}

export type AdventureResponse = ApiResponse<Adventure>;
