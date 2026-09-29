import { useQuery } from '@tanstack/react-query'
import { supabase, isMockAuth, mockDb } from '@/lib/supabase/client'
import {
  SEEDED_CATEGORIES,
  SEEDED_PRODUCTS,
  type Category,
  type Product,
} from '@/lib/data/seedMarketplace'

export interface ProductFilters {
  categoryId?: string
  searchQuery?: string
  minPrice?: number
  maxPrice?: number
  brand?: string
  crop?: string
  sortBy?: 'featured' | 'price_asc' | 'price_desc' | 'discount_desc'
}

// 1. Fetch Categories
export const fetchCategories = async (): Promise<Category[]> => {
  if (isMockAuth) {
    return SEEDED_CATEGORIES
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error || !data || data.length === 0) {
      return SEEDED_CATEGORIES
    }
    return data as Category[]
  } catch {
    return SEEDED_CATEGORIES
  }
}

// 2. Fetch Products with Filters & Full-Text Search
export const fetchProducts = async (filters: ProductFilters = {}): Promise<Product[]> => {
  const { categoryId, searchQuery, minPrice, maxPrice, brand, crop, sortBy } = filters

  if (!isMockAuth) {
    try {
      let query = supabase
        .from('products')
        .select('*, seller:sellers(shop_name, gst_no)')
        .eq('is_active', true)

      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      if (searchQuery && searchQuery.trim()) {
        const term = searchQuery.trim()
        query = query.or(
          `name.ilike.%${term}%,brand.ilike.%${term}%,crop_tags.cs.{"${term}"}`
        )
      }

      if (minPrice !== undefined && minPrice > 0) {
        query = query.gte('price', minPrice)
      }

      if (maxPrice !== undefined && maxPrice > 0) {
        query = query.lte('price', maxPrice)
      }

      if (brand) {
        query = query.eq('brand', brand)
      }

      if (crop) {
        query = query.contains('crop_tags', [crop])
      }

      if (sortBy === 'price_asc') {
        query = query.order('price', { ascending: true })
      } else if (sortBy === 'price_desc') {
        query = query.order('price', { ascending: false })
      } else {
        query = query.order('name', { ascending: true })
      }

      const { data, error } = await query
      if (!error && data && data.length > 0) {
        return data as Product[]
      }
    } catch {
      // Fallback to local seeds
    }
  }

  // Local filtering & full-text match logic (works 100% in mock/dev)
  let result = SEEDED_PRODUCTS.map((p) => ({
    ...p,
    stock: mockDb.getProductStock(p.id, p.stock),
  }))

  if (categoryId) {
    result = result.filter((p) => p.category_id === categoryId)
  }

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim()
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.crop_tags.some((tag) => tag.toLowerCase().includes(q))
    )
  }

  if (minPrice !== undefined && minPrice > 0) {
    result = result.filter((p) => p.price >= minPrice)
  }

  if (maxPrice !== undefined && maxPrice > 0) {
    result = result.filter((p) => p.price <= maxPrice)
  }

  if (brand) {
    result = result.filter((p) => p.brand.toLowerCase() === brand.toLowerCase())
  }

  if (crop) {
    result = result.filter((p) =>
      p.crop_tags.some((t) => t.toLowerCase() === crop.toLowerCase())
    )
  }

  if (sortBy === 'price_asc') {
    result.sort((a, b) => a.price - b.price)
  } else if (sortBy === 'price_desc') {
    result.sort((a, b) => b.price - a.price)
  } else if (sortBy === 'discount_desc') {
    result.sort((a, b) => {
      const discA = (a.mrp - a.price) / a.mrp
      const discB = (b.mrp - b.price) / b.mrp
      return discB - discA
    })
  }

  return result
}

// 3. Fetch Single Product
export const fetchProductById = async (id: string): Promise<Product | null> => {
  if (!isMockAuth) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, seller:sellers(shop_name, gst_no)')
        .eq('id', id)
        .maybeSingle()

      if (!error && data) {
        return data as Product
      }
    } catch {
      // Fallback
    }
  }

  const p = SEEDED_PRODUCTS.find((prod) => prod.id === id)
  if (!p) return null
  return {
    ...p,
    stock: mockDb.getProductStock(p.id, p.stock),
  }
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  })
}

export const useProducts = (filters: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 60 * 1000,
  })
}

export const useProduct = (id: string | undefined) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => (id ? fetchProductById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  })
}
