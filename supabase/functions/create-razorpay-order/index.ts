// Supabase Edge Function: create-razorpay-order
// Server-side calculation of order total from authoritative database prices & Razorpay order creation

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CartItemInput {
  product_id: string
  qty: number
}

interface RequestBody {
  items: CartItemInput[]
  shipping_address_id?: string
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || ''
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID') || 'rzp_test_kisan_dev'
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET') || 'test_secret_kisan_dev'

    // Authenticate user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized user session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body: RequestBody = await req.json()
    if (!body || typeof body !== 'object') {
      return new Response(JSON.stringify({ error: 'Invalid JSON request payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const { items } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Cart must contain at least one item' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    for (const item of items) {
      if (!item.product_id || typeof item.product_id !== 'string') {
        return new Response(JSON.stringify({ error: 'Invalid item: product_id is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      if (!item.qty || typeof item.qty !== 'number' || item.qty < 1 || !Number.isInteger(item.qty)) {
        return new Response(JSON.stringify({ error: 'Invalid item quantity: must be an integer >= 1' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // Never trust client prices: fetch authoritative prices from DB
    const productIds = items.map((i) => i.product_id)
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, name, price, stock, is_active')
      .in('id', productIds)

    if (prodError || !products) {
      return new Response(JSON.stringify({ error: 'Failed to fetch authoritative product prices' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const productMap = new Map(products.map((p) => [p.id, p]))

    let subtotal = 0
    for (const item of items) {
      const prod = productMap.get(item.product_id)
      if (!prod) {
        return new Response(JSON.stringify({ error: `Product ${item.product_id} not found` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      if (!prod.is_active) {
        return new Response(JSON.stringify({ error: `Product "${prod.name}" is currently unavailable` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      if (prod.stock < item.qty) {
        return new Response(
          JSON.stringify({
            error: `Insufficient stock for "${prod.name}". Available: ${prod.stock}, Requested: ${item.qty}`,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }
      subtotal += prod.price * item.qty
    }

    const deliveryFee = subtotal >= 500 ? 0 : 40
    const totalAmount = subtotal + deliveryFee
    const amountInPaise = Math.round(totalAmount * 100)

    let razorpayOrderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

    // Call live Razorpay API if live credentials exist
    if (
      razorpayKeyId !== 'rzp_test_kisan_dev' &&
      razorpayKeySecret !== 'test_secret_kisan_dev'
    ) {
      const credentials = btoa(`${razorpayKeyId}:${razorpayKeySecret}`)
      const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_${user.id.slice(0, 8)}_${Date.now()}`,
          notes: {
            user_id: user.id,
            items_count: items.length.toString(),
          },
        }),
      })

      if (!rzpResponse.ok) {
        const errText = await rzpResponse.text()
        return new Response(JSON.stringify({ error: `Razorpay order creation failed: ${errText}` }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const rzpData = await rzpResponse.json()
      razorpayOrderId = rzpData.id
    }

    return new Response(
      JSON.stringify({
        success: true,
        order_id: razorpayOrderId,
        amount: amountInPaise,
        currency: 'INR',
        key_id: razorpayKeyId,
        subtotal,
        delivery_fee: deliveryFee,
        total_amount: totalAmount,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
