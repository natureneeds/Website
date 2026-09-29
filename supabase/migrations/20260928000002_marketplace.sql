-- ============================================================================
-- Kisan OS Migration: MARKETPLACE MODULE
-- Categories, Sellers, Products, Carts, Cart Items, Orders, Order Items, Events
-- ============================================================================

-- 1. Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

-- 2. Sellers
CREATE TABLE IF NOT EXISTS public.sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL,
  gst_no TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

-- 3. Products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  brand TEXT,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  mrp NUMERIC(12, 2) NOT NULL CHECK (mrp >= price),
  unit TEXT NOT NULL DEFAULT 'kg',
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  images TEXT[] NOT NULL DEFAULT '{}',
  specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  crop_tags TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

-- Full-text search index on name, brand, crop_tags
CREATE INDEX IF NOT EXISTS idx_products_fts ON public.products USING GIN (
  to_tsvector('english', coalesce(name, '') || ' ' || coalesce(brand, '') || ' ' || array_to_string(crop_tags, ' '))
);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);

-- 4. Carts & Cart Items
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  qty INTEGER NOT NULL DEFAULT 1 CHECK (qty > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
  UNIQUE(cart_id, product_id)
);

-- 5. Orders, Order Items & Order Events
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
  status TEXT NOT NULL DEFAULT 'placed' CHECK (status IN ('placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled')),
  shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  qty INTEGER NOT NULL CHECK (qty > 0),
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0)
);

CREATE TABLE IF NOT EXISTS public.order_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  time TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE((auth.jwt() ->> 'role') = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Categories RLS: Public Read, Admin Write
CREATE POLICY "Categories are readable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (public.is_admin());

-- Sellers RLS: Public Read Active, Seller writes own
CREATE POLICY "Active sellers are readable by everyone" ON public.sellers FOR SELECT USING (status = 'active' OR auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Sellers can manage their own shop" ON public.sellers FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- Products RLS: Public Read, Sellers write own
CREATE POLICY "Active products are readable by everyone" ON public.products FOR SELECT USING (is_active = true OR public.is_admin() OR seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));
CREATE POLICY "Sellers write only their own products" ON public.products FOR INSERT WITH CHECK (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "Sellers update only their own products" ON public.products FOR UPDATE USING (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "Sellers delete only their own products" ON public.products FOR DELETE USING (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()) OR public.is_admin());

-- Carts RLS: Farmers see only their own carts
CREATE POLICY "Users view own cart" ON public.carts FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users insert own cart" ON public.carts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own cart" ON public.carts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own cart" ON public.carts FOR DELETE USING (auth.uid() = user_id);

-- Cart Items RLS: Farmers see/manage only items in their own carts
CREATE POLICY "Users view own cart items" ON public.cart_items FOR SELECT USING (cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "Users insert own cart items" ON public.cart_items FOR INSERT WITH CHECK (cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid()));
CREATE POLICY "Users update own cart items" ON public.cart_items FOR UPDATE USING (cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid()));
CREATE POLICY "Users delete own cart items" ON public.cart_items FOR DELETE USING (cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid()));

-- Orders RLS: Farmers see only their own orders
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins or users update own orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

-- Order Items & Events RLS
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT USING (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "Users view own order events" ON public.order_events FOR SELECT USING (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()) OR public.is_admin());
