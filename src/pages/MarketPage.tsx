import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Search,
  Filter,
  X,
  PackageX,
} from 'lucide-react'
import {
  LayoutShell,
  SectionTitle,
  Card,
  Input,
  Select,
  Button,
  Badge,
  Skeleton,
} from '@/components/ui'
import { ProductCard } from '@/components/marketplace/ProductCard'
import {
  useCategories,
  useProducts,
  type ProductFilters,
} from '@/lib/api/marketplace'
import { CROP_OPTIONS } from '@/lib/data/locations'

export const MarketPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { category: categoryParam } = useParams<{ category?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()

  // State
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '')
  const [debouncedQuery, setDebouncedQuery] = useState(searchParams.get('q') || '')
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [selectedCrop, setSelectedCrop] = useState<string>('')
  const [minPrice, setMinPrice] = useState<number | undefined>()
  const [maxPrice, setMaxPrice] = useState<number | undefined>()
  const [sortBy, setSortBy] = useState<ProductFilters['sortBy']>('featured')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Debounce search query 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput)
      if (searchInput.trim()) {
        searchParams.set('q', searchInput.trim())
      } else {
        searchParams.delete('q')
      }
      setSearchParams(searchParams, { replace: true })
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput, searchParams, setSearchParams])

  // Fetch categories
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories()

  // Match categoryParam to category ID or name
  const activeCategory = useMemo(() => {
    if (!categoryParam) return undefined
    const slug = categoryParam.toLowerCase()
    return categories.find(
      (c) =>
        c.id.toLowerCase() === slug ||
        c.name.toLowerCase().replace(/\s+/g, '-') === slug ||
        c.name.toLowerCase() === slug
    )
  }, [categoryParam, categories])

  // Product Query
  const filters: ProductFilters = useMemo(
    () => ({
      categoryId: activeCategory?.id,
      searchQuery: debouncedQuery,
      minPrice,
      maxPrice,
      brand: selectedBrand || undefined,
      crop: selectedCrop || undefined,
      sortBy,
    }),
    [activeCategory?.id, debouncedQuery, minPrice, maxPrice, selectedBrand, selectedCrop, sortBy]
  )

  const { data: products = [], isLoading: isProductsLoading } = useProducts(filters)

  // Extract unique brands for filter dropdown
  const uniqueBrands = useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => {
      if (p.brand) set.add(p.brand)
    })
    return Array.from(set).sort()
  }, [products])

  const handleCategoryClick = (catId?: string) => {
    if (!catId) {
      navigate('/market')
    } else {
      const targetCat = categories.find((c) => c.id === catId)
      if (targetCat) {
        const slug = targetCat.name.toLowerCase().replace(/\s+/g, '-')
        navigate(`/market/${slug}`)
      }
    }
  }

  const handleResetFilters = () => {
    setSearchInput('')
    setDebouncedQuery('')
    setSelectedBrand('')
    setSelectedCrop('')
    setMinPrice(undefined)
    setMaxPrice(undefined)
    setSortBy('featured')
    navigate('/market')
  }

  return (
    <LayoutShell>
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex flex-col gap-8">
        {/* Header with Title and Result Counter */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <Badge variant="forest">
              {t('nav.marketplace')}
            </Badge>

            <span className="text-xs text-muted font-mono uppercase tracking-wider">
              {t('market.resultsCount', { count: products.length })}
            </span>
          </div>

          <SectionTitle
            size="lg"
            title={activeCategory ? activeCategory.name : t('market.title')}
            subtitle={t('market.subtitle')}
            contrast="light"
          />
        </div>

        {/* ====================================================================
            1. CATEGORY CHIPS ROW (Scrollable Pills)
            ==================================================================== */}
        <div className="w-full overflow-x-auto no-scrollbar pb-2">
          <div className="flex items-center gap-2.5 min-w-max">
            <button
              type="button"
              onClick={() => handleCategoryClick()}
              className={`min-h-touch px-4 py-2 text-sm font-semibold rounded-pill transition-all select-none ${
                !activeCategory
                  ? 'bg-lime text-ink shadow-sm scale-[1.02]'
                  : 'bg-surface-alt text-forest border border-line hover:border-forest hover:bg-surface'
              }`}
            >
              {t('market.allCategories')}
            </button>

            {isCategoriesLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} variant="button" className="w-28" />
                ))
              : categories.map((cat) => {
                  const isActive = activeCategory?.id === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryClick(cat.id)}
                      className={`min-h-touch px-4 py-2 text-sm font-semibold rounded-pill transition-all select-none ${
                        isActive
                          ? 'bg-lime text-ink shadow-sm scale-[1.02]'
                          : 'bg-surface-alt text-forest border border-line hover:border-forest hover:bg-surface'
                      }`}
                    >
                      {cat.name}
                    </button>
                  )
                })}
          </div>
        </div>

        {/* ====================================================================
            2. SEARCH & CONTROLS BAR
            ==================================================================== */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Debounced Search Bar */}
          <div className="w-full flex-1 relative flex items-center">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('market.searchPlaceholder')}
              icon={<Search className="w-4 h-4 text-forest" />}
              className="pr-10"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-4 text-muted hover:text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action Buttons: Filter Drawer Trigger & Sort Dropdown */}
          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-between sm:justify-start">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsFilterOpen(true)}
              icon={<Filter className="w-4 h-4" />}
            >
              <span>{t('market.filterBtn')}</span>
              {(selectedBrand || selectedCrop || minPrice || maxPrice) && (
                <span className="w-2 h-2 rounded-pill bg-lime inline-block" />
              )}
            </Button>

            <div className="min-w-[170px]">
              <Select
                options={[
                  { value: 'featured', label: t('market.sortFeatured') },
                  { value: 'price_asc', label: t('market.sortPriceLow') },
                  { value: 'price_desc', label: t('market.sortPriceHigh') },
                  { value: 'discount_desc', label: t('market.sortDiscount') },
                ]}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as ProductFilters['sortBy'])}
              />
            </div>
          </div>
        </div>

        {/* ====================================================================
            3. PRODUCT GRID (SURFACE / CREAM CARDS)
            ==================================================================== */}
        {isProductsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} variant="surface" className="flex flex-col gap-4">
                <Skeleton variant="card" className="h-44 w-full rounded-input" />
                <Skeleton variant="text" className="w-3/4" />
                <Skeleton variant="text" className="w-1/2" />
                <Skeleton variant="button" className="w-full" />
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card variant="surface" className="flex flex-col items-center justify-center p-12 text-center gap-4">
            <div className="w-16 h-16 rounded-pill bg-surface-alt border border-line flex items-center justify-center text-forest">
              <PackageX className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-medium text-ink">{t('market.emptyTitle')}</h3>
            <p className="text-body text-muted max-w-md">{t('market.emptyDesc')}</p>
            <Button variant="accent" size="sm" onClick={handleResetFilters}>
              {t('market.clearFilters')}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {products.map((p, index) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                image={p.images[0] || '/images/marketplace.bmp'}
                price={p.price}
                mrp={p.mrp}
                badge={p.mrp > p.price ? `-${Math.round(((p.mrp - p.price) / p.mrp) * 100)}%` : undefined}
                buttonVariant={index % 3 === 0 ? 'lime' : 'surface'}
                onClick={() => navigate(`/product/${p.id}`)}
              />
            ))}
          </div>
        )}

        {/* ====================================================================
            4. FILTER DRAWER / MODAL
            ==================================================================== */}
        {isFilterOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsFilterOpen(false)}
          >
            <div
              className="w-full max-w-lg bg-white border border-line rounded-card p-6 md:p-8 text-ink shadow-2xl flex flex-col gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-line">
                <div className="flex items-center gap-2.5">
                  <Filter className="w-5 h-5 text-forest" />
                  <h3 className="text-xl font-medium text-ink">
                    {t('market.filterTitle')}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="w-8 h-8 rounded-pill flex items-center justify-center text-muted hover:text-ink"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Price Filters */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink/80">
                  {t('market.priceRange')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    placeholder={t('market.minPrice')}
                    value={minPrice !== undefined ? minPrice : ''}
                    onChange={(e) =>
                      setMinPrice(e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                  <Input
                    type="number"
                    placeholder={t('market.maxPrice')}
                    value={maxPrice !== undefined ? maxPrice : ''}
                    onChange={(e) =>
                      setMaxPrice(e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </div>
              </div>

              {/* Brand Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink/80">
                  {t('market.brandLabel')}
                </label>
                <Select
                  options={[
                    { value: '', label: t('market.allBrands') },
                    ...uniqueBrands.map((b) => ({ value: b, label: b })),
                  ]}
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                />
              </div>

              {/* Crop Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink/80">
                  {t('market.cropTagLabel')}
                </label>
                <Select
                  options={[
                    { value: '', label: t('market.allCrops') },
                    ...CROP_OPTIONS.map((c) => ({ value: c.label.split(' ')[0], label: c.label })),
                  ]}
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-line flex items-center justify-between gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedBrand('')
                    setSelectedCrop('')
                    setMinPrice(undefined)
                    setMaxPrice(undefined)
                  }}
                >
                  {t('market.clearFilters')}
                </Button>

                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => setIsFilterOpen(false)}
                >
                  {t('market.applyFilters')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </LayoutShell>
  )
}
