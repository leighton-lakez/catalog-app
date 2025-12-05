-- =============================================
-- NEW FEATURES MIGRATION
-- =============================================

-- 1. PRODUCT VARIANTS
-- =============================================
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- e.g., "Size", "Color"
  value VARCHAR(255) NOT NULL, -- e.g., "Large", "Red"
  price_adjustment DECIMAL(10,2) DEFAULT 0, -- +/- from base price
  stock_quantity INTEGER DEFAULT -1, -- -1 = use parent stock
  sku VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_variants_product ON product_variants(product_id);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view variants of their products" ON product_variants
  FOR SELECT USING (
    product_id IN (SELECT id FROM products WHERE reseller_id = auth.uid())
  );

CREATE POLICY "Users can manage variants of their products" ON product_variants
  FOR ALL USING (
    product_id IN (SELECT id FROM products WHERE reseller_id = auth.uid())
  );

CREATE POLICY "Public can view active product variants" ON product_variants
  FOR SELECT USING (
    product_id IN (SELECT id FROM products WHERE is_active = true)
  );

-- 2. DISCOUNT/COUPON CODES
-- =============================================
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reseller_id UUID REFERENCES resellers(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed', 'free_shipping')),
  value DECIMAL(10,2) NOT NULL, -- percentage (0-100) or fixed amount
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_uses INTEGER DEFAULT NULL, -- NULL = unlimited
  times_used INTEGER DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reseller_id, code)
);

CREATE INDEX idx_discount_codes_reseller ON discount_codes(reseller_id);
CREATE INDEX idx_discount_codes_code ON discount_codes(code);

ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their discount codes" ON discount_codes
  FOR ALL USING (reseller_id = auth.uid());

-- Add discount tracking to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;

-- 3. LOW STOCK ALERTS
-- =============================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5;
ALTER TABLE resellers ADD COLUMN IF NOT EXISTS low_stock_email_alerts BOOLEAN DEFAULT true;

-- 4. ORDER NOTIFICATIONS (store email settings)
-- =============================================
ALTER TABLE resellers ADD COLUMN IF NOT EXISTS order_notifications JSONB DEFAULT '{"on_order": true, "on_confirm": true, "on_ship": true, "on_deliver": false}'::jsonb;
ALTER TABLE resellers ADD COLUMN IF NOT EXISTS notification_email VARCHAR(255);

-- Add tracking number to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS carrier VARCHAR(50);

-- 5. PRODUCT REVIEWS/RATINGS
-- =============================================
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  review TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_reviews_product ON product_reviews(product_id);
CREATE INDEX idx_product_reviews_approved ON product_reviews(is_approved);

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved reviews" ON product_reviews
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can manage reviews of their products" ON product_reviews
  FOR ALL USING (
    product_id IN (SELECT id FROM products WHERE reseller_id = auth.uid())
  );

-- Add average rating cache to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(2,1) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- 6. CUSTOMER ACCOUNTS
-- =============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reseller_id UUID REFERENCES resellers(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255), -- NULL = guest checkout
  name VARCHAR(255),
  phone VARCHAR(50),
  default_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  UNIQUE(reseller_id, email)
);

CREATE INDEX idx_customers_reseller ON customers(reseller_id);
CREATE INDEX idx_customers_email ON customers(email);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their customers" ON customers
  FOR ALL USING (reseller_id = auth.uid());

-- Link orders to customer accounts
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

-- 7. WISHLIST
-- =============================================
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, product_id)
);

CREATE INDEX idx_wishlists_customer ON wishlists(customer_id);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view wishlists of their customers" ON wishlists
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE reseller_id = auth.uid())
  );

-- 8. INVENTORY HISTORY/LOG
-- =============================================
CREATE TABLE IF NOT EXISTS inventory_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  change_amount INTEGER NOT NULL, -- positive = added, negative = removed
  new_quantity INTEGER NOT NULL,
  reason VARCHAR(50) NOT NULL, -- 'sale', 'restock', 'adjustment', 'return', 'cancelled_order'
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_inventory_log_product ON inventory_log(product_id);
CREATE INDEX idx_inventory_log_date ON inventory_log(created_at);

ALTER TABLE inventory_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their inventory logs" ON inventory_log
  FOR ALL USING (
    product_id IN (SELECT id FROM products WHERE reseller_id = auth.uid())
  );

-- 9. PRODUCT BUNDLES
-- =============================================
CREATE TABLE IF NOT EXISTS product_bundles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reseller_id UUID REFERENCES resellers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  bundle_price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bundle_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bundle_id UUID REFERENCES product_bundles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1
);

CREATE INDEX idx_product_bundles_reseller ON product_bundles(reseller_id);
CREATE INDEX idx_bundle_items_bundle ON bundle_items(bundle_id);

ALTER TABLE product_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their bundles" ON product_bundles
  FOR ALL USING (reseller_id = auth.uid());

CREATE POLICY "Users can manage their bundle items" ON bundle_items
  FOR ALL USING (
    bundle_id IN (SELECT id FROM product_bundles WHERE reseller_id = auth.uid())
  );

-- 10. SALES GOALS
-- =============================================
CREATE TABLE IF NOT EXISTS sales_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reseller_id UUID REFERENCES resellers(id) ON DELETE CASCADE,
  period VARCHAR(20) NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')),
  target_amount DECIMAL(10,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sales_goals_reseller ON sales_goals(reseller_id);

ALTER TABLE sales_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their sales goals" ON sales_goals
  FOR ALL USING (reseller_id = auth.uid());

-- 11. STORE HOURS / AVAILABILITY
-- =============================================
ALTER TABLE resellers ADD COLUMN IF NOT EXISTS store_hours JSONB DEFAULT '{
  "monday": {"open": "09:00", "close": "17:00", "closed": false},
  "tuesday": {"open": "09:00", "close": "17:00", "closed": false},
  "wednesday": {"open": "09:00", "close": "17:00", "closed": false},
  "thursday": {"open": "09:00", "close": "17:00", "closed": false},
  "friday": {"open": "09:00", "close": "17:00", "closed": false},
  "saturday": {"open": "10:00", "close": "14:00", "closed": false},
  "sunday": {"open": null, "close": null, "closed": true}
}'::jsonb;

ALTER TABLE resellers ADD COLUMN IF NOT EXISTS vacation_mode BOOLEAN DEFAULT false;
ALTER TABLE resellers ADD COLUMN IF NOT EXISTS vacation_message TEXT;

-- 12. ORDER NOTES/TAGS
-- =============================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS internal_notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 13. ABANDONED CARTS
-- =============================================
CREATE TABLE IF NOT EXISTS abandoned_carts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reseller_id UUID REFERENCES resellers(id) ON DELETE CASCADE,
  customer_email VARCHAR(255),
  customer_name VARCHAR(255),
  cart_items JSONB NOT NULL,
  cart_total DECIMAL(10,2),
  recovery_email_sent BOOLEAN DEFAULT false,
  recovered BOOLEAN DEFAULT false,
  recovered_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_abandoned_carts_reseller ON abandoned_carts(reseller_id);
CREATE INDEX idx_abandoned_carts_email ON abandoned_carts(customer_email);

ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their abandoned carts" ON abandoned_carts
  FOR ALL USING (reseller_id = auth.uid());

-- 14. DARK MODE PREFERENCE
-- =============================================
ALTER TABLE resellers ADD COLUMN IF NOT EXISTS dark_mode BOOLEAN DEFAULT false;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_discount_code ON orders(discount_code);
CREATE INDEX IF NOT EXISTS idx_products_avg_rating ON products(avg_rating);
