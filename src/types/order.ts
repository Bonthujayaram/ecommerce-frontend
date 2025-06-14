import { CartItem } from "./cart";
import { Address } from "./address";

export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id?: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  address: Address;
  paymentMethod: 'UPI' | 'QR';
  paymentDetails: {
    upiId?: string;
    method?: string;
  };
  status: OrderStatus;
  orderDate: string;
} 