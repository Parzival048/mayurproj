// Database Types for HeritageKart

export type UserRole = 'customer' | 'admin'
export type AuthenticityStatus = 'pending' | 'verified' | 'rejected'
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type PaymentMethod = 'cod' | 'online'

export interface Profile {
    id: string
    email: string
    full_name: string | null
    phone: string | null
    role: UserRole
    avatar_url: string | null
    created_at: string
    updated_at: string
}

export interface Category {
    id: string
    name: string
    slug: string
    description: string | null
    image_url: string | null
    parent_id: string | null
    created_at: string
}

export interface Artifact {
    id: string
    title: string
    slug: string
    description: string | null
    price: number
    quantity: number
    category_id: string | null
    images: string[]
    authenticity_status: AuthenticityStatus
    cultural_tags: string[]
    origin_period: string | null
    origin_location: string | null
    dimensions: string | null
    material: string | null
    is_featured: boolean
    is_active: boolean
    created_at: string
    updated_at: string
    // Joined fields
    category?: Category
}

export interface CartItem {
    id: string
    user_id: string
    artifact_id: string
    quantity: number
    created_at: string
    // Joined fields
    artifact?: Artifact
}

export interface Address {
    id: string
    user_id: string
    full_name: string
    phone: string
    street: string
    city: string
    state: string
    postal_code: string
    country: string
    is_default: boolean
    created_at: string
}

export interface ShippingAddress {
    full_name: string
    phone: string
    street: string
    city: string
    state: string
    postal_code: string
    country: string
}

export interface Order {
    id: string
    order_number: string
    user_id: string
    shipping_address: ShippingAddress
    status: OrderStatus
    total_amount: number
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    notes: string | null
    created_at: string
    updated_at: string
    // Joined fields
    order_items?: OrderItem[]
    profile?: Profile
}

export interface OrderItem {
    id: string
    order_id: string
    artifact_id: string
    artifact_title: string
    artifact_image: string | null
    quantity: number
    price_at_time: number
    created_at: string
    // Joined fields
    artifact?: Artifact
}

// API Response Types
export interface PaginatedResponse<T> {
    data: T[]
    count: number
    page: number
    pageSize: number
    totalPages: number
}

export interface ApiError {
    message: string
    code?: string
}

// Filter Types
export interface ArtifactFilters {
    search?: string
    category?: string
    minPrice?: number
    maxPrice?: number
    inStock?: boolean
    featured?: boolean
    authenticity?: AuthenticityStatus
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'title'
}

// Dashboard Stats
export interface DashboardStats {
    totalUsers: number
    totalOrders: number
    totalRevenue: number
    totalProducts: number
    recentOrders: Order[]
    ordersByStatus: {
        pending: number
        processing: number
        shipped: number
        delivered: number
        cancelled: number
    }
}
