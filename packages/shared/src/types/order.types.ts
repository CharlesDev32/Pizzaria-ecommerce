export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  unitPriceSnapshot: number;
  selectedOptions?: Array<{ groupId: string; optionId: string }>;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  couponCode?: string;
}

export interface OrderTimeline {
  id: string;
  fromStatus?: OrderStatus;
  toStatus: OrderStatus;
  createdAt: string;
}

export type OrderStatus = 'received' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'canceled';
export type PaymentOnDelivery = 'cash_on_delivery' | 'card_on_delivery';

export interface DeliveryAddress {
  id: string;
  label: string;
  street: string;
  number: string;
  complement?: string;
  neighborhoodId: string;
  reference?: string;
  isDefault: boolean;
}

export interface DeliverySlot {
  id: string;
  startAt: string;
  endAt: string;
  capacity: number;
  isActive: boolean;
  usedCapacity: number;
}

export interface Order {
  id: string;
  userId: string;
  orderType: 'delivery';
  status: OrderStatus;
  subtotal: number;
  discountTotal: number;
  deliveryFee: number;
  grandTotal: number;
  idempotencyKey: string;
  paymentMethod: PaymentOnDelivery;
  changeFor?: number;
  notes?: string;
  scheduledAt?: string;
  slotId?: string;
  addressSnapshot: {
    label: string;
    street: string;
    number: string;
    complement?: string;
    neighborhoodName: string;
    zoneName: string;
  };
  couponCode?: string;
  items: Array<{
    id: string;
    productId: string;
    titleSnapshot: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    options?: Array<{
      groupId: string;
      groupName: string;
      optionId: string;
      optionName: string;
      priceDelta: number;
    }>;
  }>;
  timeline: OrderTimeline[];
}
