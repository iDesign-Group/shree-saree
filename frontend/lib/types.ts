export type Product = {
  id: number;
  product_code: string;
  name: string;
  price_per_saree: number;
  sarees_per_bundle?: number;
  bundle_price?: number;
  primary_image?: string | null;
};

export type Order = {
  id: number;
  order_number: string;
  order_status: string;
  created_at: string;
};
