export enum PaymentMethod {
  STRIPE = 'STRIPE',
  VNPAY = 'VNPAY',
  PAYPAL = 'PAYPAL'
}

export enum PaymentOrderStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}

export interface PaymentOrder {
  id: number;
  amount: number;
  status: PaymentOrderStatus;
  paymentMethod: PaymentMethod;
  user: any;
}

export interface PaymentResponse {
  payment_url: string;
  payment_id?: string;
}