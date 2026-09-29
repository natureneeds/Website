-- ============================================================================
-- Migration: 20260928000009_phase6_checkout.sql
-- Description: Phase 6 Checkout, Addresses, Atomic Stock Decrement & Orders
-- ============================================================================

-- 1. Create user_addresses table
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  village TEXT NOT NULL,
  landmark TEXT,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON public.user_addresses(user_id);

-- Enable RLS on user_addresses
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own addresses" ON public.user_addresses
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users insert own addresses" ON public.user_addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own addresses" ON public.user_addresses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own addresses" ON public.user_addresses
  FOR DELETE USING (auth.uid() = user_id);

-- 2. Add payment and status columns to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cod';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;

-- Update status constraint on orders to support standard timeline: placed -> packed -> shipped -> delivered
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('placed', 'packed', 'shipped', 'delivered', 'confirmed', 'out_for_delivery', 'cancelled'));

-- 3. Atomic Order Placement & Stock Decrement Function
-- Never trusts client-sent prices: calculates line totals from products table
CREATE OR REPLACE FUNCTION public.decrement_stock_and_create_order(
  p_user_id UUID,
  p_items JSONB,
  p_shipping_address JSONB,
  p_payment_method TEXT,
  p_razorpay_order_id TEXT DEFAULT NULL,
  p_razorpay_payment_id TEXT DEFAULT NULL,
  p_razorpay_signature TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item RECORD;
  v_product RECORD;
  v_subtotal NUMERIC(12, 2) := 0;
  v_delivery NUMERIC(12, 2) := 0;
  v_total NUMERIC(12, 2) := 0;
  v_order_id UUID;
  v_cart_id UUID;
BEGIN
  -- Validate items exist
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item.';
  END IF;

  -- Verify each product, check stock, decrement stock, and sum authoritative price
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, qty INTEGER)
  LOOP
    IF v_item.qty <= 0 THEN
      RAISE EXCEPTION 'Quantity for item % must be greater than zero.', v_item.product_id;
    END IF;

    SELECT id, name, price, stock, is_active
    INTO v_product
    FROM public.products
    WHERE id = v_item.product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product with ID % not found.', v_item.product_id;
    END IF;

    IF NOT v_product.is_active THEN
      RAISE EXCEPTION 'Product % is currently unavailable.', v_product.name;
    END IF;

    IF v_product.stock < v_item.qty THEN
      RAISE EXCEPTION 'Insufficient stock for product % (Available: %, Requested: %)', v_product.name, v_product.stock, v_item.qty;
    END IF;

    -- Atomically decrement stock
    UPDATE public.products
    SET stock = stock - v_item.qty,
        updated_at = timezone('utc'::TEXT, now())
    WHERE id = v_item.product_id;

    -- Authoritative server pricing
    v_subtotal := v_subtotal + (v_product.price * v_item.qty);
  END LOOP;

  -- Calculate delivery: Free above 500, else 40
  IF v_subtotal < 500 THEN
    v_delivery := 40.00;
  ELSE
    v_delivery := 0.00;
  END IF;

  v_total := v_subtotal + v_delivery;

  -- Create order record
  INSERT INTO public.orders (
    user_id,
    total_amount,
    status,
    shipping_address,
    payment_method,
    payment_status,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    v_total,
    'placed',
    p_shipping_address,
    p_payment_method,
    CASE WHEN p_payment_method = 'razorpay' THEN 'paid' ELSE 'pending' END,
    p_razorpay_order_id,
    p_razorpay_payment_id,
    p_razorpay_signature,
    timezone('utc'::TEXT, now()),
    timezone('utc'::TEXT, now())
  ) RETURNING id INTO v_order_id;

  -- Insert order items with server prices
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, qty INTEGER)
  LOOP
    SELECT price INTO v_product FROM public.products WHERE id = v_item.product_id;
    INSERT INTO public.order_items (order_id, product_id, qty, price)
    VALUES (v_order_id, v_item.product_id, v_item.qty, v_product.price);
  END LOOP;

  -- Insert initial order timeline event: 'placed'
  INSERT INTO public.order_events (order_id, status, time)
  VALUES (v_order_id, 'placed', timezone('utc'::TEXT, now()));

  -- Clear user's active cart items
  SELECT id INTO v_cart_id FROM public.carts WHERE user_id = p_user_id;
  IF v_cart_id IS NOT NULL THEN
    DELETE FROM public.cart_items WHERE cart_id = v_cart_id;
  END IF;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'total_amount', v_total,
    'subtotal', v_subtotal,
    'delivery_fee', v_delivery,
    'status', 'placed',
    'payment_method', p_payment_method,
    'created_at', timezone('utc'::TEXT, now())
  );
END;
$$;
