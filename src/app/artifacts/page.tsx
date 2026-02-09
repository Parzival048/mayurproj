'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { Button, Input, Badge, ProductGridSkeleton } from '@/components/ui'
import { ArtifactGrid } from '@/components/artifacts'
import { createClient } from '@/lib/supabase/client'
import { cn, debounce } from '@/lib/utils'
import type { Artifact, Category, ArtifactFilters } from '@/types'

function ArtifactsContent() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const supabase = createClient()

    const [artifacts, setArtifacts] = useState<Artifact[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showFilters, setShowFilters] = useState(false)
    const [totalCount, setTotalCount] = useState(0)

    // Get filters from URL
    const filters: ArtifactFilters = {
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || '',
        minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
        maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
        inStock: searchParams.get('inStock') === 'true',
        featured: searchParams.get('featured') === 'true',
        authenticity: searchParams.get('authenticity') as 'verified' | 'pending' | undefined,
        sortBy: (searchParams.get('sortBy') as ArtifactFilters['sortBy']) || 'newest',
    }

    // Update URL with filters
    const updateFilters = useCallback((newFilters: Partial<ArtifactFilters>) => {
        const params = new URLSearchParams(searchParams.toString())

        Object.entries(newFilters).forEach(([key, value]) => {
            if (value === undefined || value === '' || value === false) {
                params.delete(key)
            } else {
                params.set(key, String(value))
            }
        })

        router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }, [searchParams, router, pathname])

    // Debounced search
    const debouncedSearch = useCallback(
        debounce((value: string) => updateFilters({ search: value }), 300),
        [updateFilters]
    )

    // Fetch categories
    useEffect(() => {
        async function fetchCategories() {
            const { data } = await supabase.from('categories').select('*').order('name')
            setCategories(data || [])
        }
        fetchCategories()
    }, [supabase])

    // Fetch artifacts
    useEffect(() => {
        async function fetchArtifacts() {
            setIsLoading(true)

            let query = supabase
                .from('artifacts')
                .select('*, category:categories(*)', { count: 'exact' })
                .eq('is_active', true)

            // Apply filters
            if (filters.search) {
                query = query.ilike('title', `%${filters.search}%`)
            }

            if (filters.category) {
                const categoryData = categories.find(c => c.slug === filters.category)
                if (categoryData) {
                    query = query.eq('category_id', categoryData.id)
                }
            }

            if (filters.minPrice) {
                query = query.gte('price', filters.minPrice)
            }

            if (filters.maxPrice) {
                query = query.lte('price', filters.maxPrice)
            }

            if (filters.inStock) {
                query = query.gt('quantity', 0)
            }

            if (filters.featured) {
                query = query.eq('is_featured', true)
            }

            if (filters.authenticity) {
                query = query.eq('authenticity_status', filters.authenticity)
            }

            // Apply sorting
            switch (filters.sortBy) {
                case 'price_asc':
                    query = query.order('price', { ascending: true })
                    break
                case 'price_desc':
                    query = query.order('price', { ascending: false })
                    break
                case 'oldest':
                    query = query.order('created_at', { ascending: true })
                    break
                case 'title':
                    query = query.order('title', { ascending: true })
                    break
                case 'newest':
                default:
                    query = query.order('created_at', { ascending: false })
            }

            const { data, count } = await query

            setArtifacts((data || []) as Artifact[])
            setTotalCount(count || 0)
            setIsLoading(false)
        }

        fetchArtifacts()
    }, [supabase, searchParams, categories])

    const clearFilters = () => {
        router.push(pathname)
    }

    const activeFilterCount = [
        filters.search,
        filters.category,
        filters.minPrice,
        filters.maxPrice,
        filters.inStock,
        filters.featured,
        filters.authenticity,
    ].filter(Boolean).length

    return (
        <div className="min-h-screen">
            {/* Page Header */}
            <div className="border-b border-stone-200 bg-gradient-to-br from-amber-50 to-white py-12 dark:border-stone-800 dark:from-stone-900 dark:to-stone-950">
                <div className="mx-auto max-w-7xl px-4">
                    <h1 className="text-3xl font-bold text-stone-900 dark:text-white sm:text-4xl">
                        {filters.category
                            ? categories.find(c => c.slug === filters.category)?.name || 'Artifacts'
                            : filters.featured
                                ? 'Featured Artifacts'
                                : 'All Artifacts'}
                    </h1>
                    <p className="mt-2 text-stone-600 dark:text-stone-400">
                        {totalCount} {totalCount === 1 ? 'item' : 'items'} found
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Controls */}
                <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Search */}
                    <div className="relative max-w-md flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                        <input
                            type="text"
                            defaultValue={filters.search}
                            onChange={(e) => debouncedSearch(e.target.value)}
                            placeholder="Search artifacts..."
                            className="h-11 w-full rounded-xl border border-stone-200 bg-white pl-10 pr-4 text-sm transition-all focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-900"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Filter Toggle */}
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="relative"
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-xs text-white">
                                    {activeFilterCount}
                                </span>
                            )}
                        </Button>

                        {/* Sort */}
                        <select
                            value={filters.sortBy || 'newest'}
                            onChange={(e) => updateFilters({ sortBy: e.target.value as ArtifactFilters['sortBy'] })}
                            className="h-11 rounded-xl border border-stone-200 bg-white px-4 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-900"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="title">Alphabetical</option>
                        </select>
                    </div>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-8 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 p-6 dark:border-stone-800 dark:bg-stone-900"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-stone-900 dark:text-white">Filters</h3>
                            {activeFilterCount > 0 && (
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-amber-600 hover:text-amber-700"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {/* Category */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
                                    Category
                                </label>
                                <select
                                    value={filters.category || ''}
                                    onChange={(e) => updateFilters({ category: e.target.value })}
                                    className="h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm dark:border-stone-700 dark:bg-stone-800"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.slug}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
                                    Price Range
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.minPrice || ''}
                                        onChange={(e) => updateFilters({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
                                        className="h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm dark:border-stone-700 dark:bg-stone-800"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.maxPrice || ''}
                                        onChange={(e) => updateFilters({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                                        className="h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm dark:border-stone-700 dark:bg-stone-800"
                                    />
                                </div>
                            </div>

                            {/* Authenticity */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
                                    Authenticity
                                </label>
                                <select
                                    value={filters.authenticity || ''}
                                    onChange={(e) => updateFilters({ authenticity: e.target.value as 'verified' | 'pending' | undefined })}
                                    className="h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm dark:border-stone-700 dark:bg-stone-800"
                                >
                                    <option value="">All</option>
                                    <option value="verified">Verified Only</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>

                            {/* Checkboxes */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
                                    Options
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={filters.inStock}
                                            onChange={(e) => updateFilters({ inStock: e.target.checked })}
                                            className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                                        />
                                        <span className="text-sm text-stone-600 dark:text-stone-400">In Stock Only</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={filters.featured}
                                            onChange={(e) => updateFilters({ featured: e.target.checked })}
                                            className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                                        />
                                        <span className="text-sm text-stone-600 dark:text-stone-400">Featured Only</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Active Filters */}
                {activeFilterCount > 0 && (
                    <div className="mb-6 flex flex-wrap gap-2">
                        {filters.search && (
                            <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                                Search: {filters.search}
                                <button onClick={() => updateFilters({ search: '' })}>
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        )}
                        {filters.category && (
                            <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                                {categories.find(c => c.slug === filters.category)?.name}
                                <button onClick={() => updateFilters({ category: '' })}>
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        )}
                        {filters.inStock && (
                            <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                                In Stock
                                <button onClick={() => updateFilters({ inStock: false })}>
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        )}
                        {filters.featured && (
                            <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                                Featured
                                <button onClick={() => updateFilters({ featured: false })}>
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        )}
                        {filters.authenticity && (
                            <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                                {filters.authenticity === 'verified' ? 'Verified' : 'Pending'}
                                <button onClick={() => updateFilters({ authenticity: undefined })}>
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        )}
                    </div>
                )}

                {/* Results */}
                {isLoading ? (
                    <ProductGridSkeleton count={8} />
                ) : artifacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
                            <Search className="h-10 w-10 text-stone-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-stone-900 dark:text-white">
                            No artifacts found
                        </h3>
                        <p className="mt-2 text-stone-600 dark:text-stone-400">
                            Try adjusting your search or filters
                        </p>
                        <Button onClick={clearFilters} className="mt-4">
                            Clear Filters
                        </Button>
                    </div>
                ) : (
                    <ArtifactGrid artifacts={artifacts} />
                )}
            </div>
        </div>
    )
}

export default function ArtifactsPage() {
    return (
        <Suspense fallback={<ProductGridSkeleton count={8} />}>
            <ArtifactsContent />
        </Suspense>
    )
}
