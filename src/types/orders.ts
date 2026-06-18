export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';

export type OrderItemSnapshot = {
  productId: string;
  productName: string;
  variantId?: string;
  variantLabel?: string;
  quantity: number;
  unitPrice: number;
};

export type Order = {
  id: string;
  user_id: string;
  status: OrderStatus;
  amount: number;
  points_earned: number;
  payment_method_slug: string | null;
  delivery_json: Record<string, string>;
  seller_notes: string | null;
  promo_code: string | null;
  items_json: OrderItemSnapshot[];
  purchase_id: string | null;
  confirmed_by: string | null;
  confirmed_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderWithProfile = Order & {
  username?: string;
  user_email?: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  variant_id: string | null;
  variant_label: string | null;
  quantity: number;
  unit_price: number;
  sort_order: number;
};
