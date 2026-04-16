'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Artifact, Profile } from '@/types'

interface CartState {
    items: (CartItem & { artifact: Artifact })[]
    isOpen: boolean
    setItems: (items: (CartItem & { artifact: Artifact })[]) => void
    addItem: (artifact: Artifact, quantity?: number) => void
    updateQuantity: (artifactId: string, quantity: number) => void
    removeItem: (artifactId: string) => void
    clearCart: () => void
    toggleCart: () => void
    openCart: () => void
    closeCart: () => void
    getTotalItems: () => number
    getTotalPrice: () => number
}

interface AuthState {
    user: Profile | null
    isLoading: boolean
    setUser: (user: Profile | null) => void
    setLoading: (loading: boolean) => void
}

interface UIState {
    isMobileMenuOpen: boolean
    isSearchOpen: boolean
    toggleMobileMenu: () => void
    closeMobileMenu: () => void
    toggleSearch: () => void
    closeSearch: () => void
}

// Cart Store
export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            setItems: (items) => set({ items }),

            addItem: (artifact, quantity = 1) => {
                const { items } = get()
                const existing = items.find(item => item.artifact_id === artifact.id)

                if (existing) {
                    set({
                        items: items.map(item =>
                            item.artifact_id === artifact.id
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        ),
                    })
                } else {
                    set({
                        items: [
                            ...items,
                            {
                                id: crypto.randomUUID(),
                                user_id: '',
                                artifact_id: artifact.id,
                                quantity,
                                created_at: new Date().toISOString(),
                                artifact,
                            },
                        ],
                    })
                }
            },

            updateQuantity: (artifactId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(artifactId)
                    return
                }
                set({
                    items: get().items.map(item =>
                        item.artifact_id === artifactId ? { ...item, quantity } : item
                    ),
                })
            },

            removeItem: (artifactId) =>
                set({ items: get().items.filter(item => item.artifact_id !== artifactId) }),

            clearCart: () => set({ items: [] }),

            toggleCart: () => set({ isOpen: !get().isOpen }),
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),

            getTotalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
            getTotalPrice: () =>
                get().items.reduce((acc, item) => acc + item.artifact.price * item.quantity, 0),
        }),
        {
            name: 'heritagekart-cart',
            partialize: (state) => ({ items: state.items }),
        }
    )
)

// Auth Store
export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,
    setUser: (user) => set({ user }),
    setLoading: (isLoading) => set({ isLoading }),
}))

// UI Store
export const useUIStore = create<UIState>((set, get) => ({
    isMobileMenuOpen: false,
    isSearchOpen: false,
    toggleMobileMenu: () => set({ isMobileMenuOpen: !get().isMobileMenuOpen }),
    closeMobileMenu: () => set({ isMobileMenuOpen: false }),
    toggleSearch: () => set({ isSearchOpen: !get().isSearchOpen }),
    closeSearch: () => set({ isSearchOpen: false }),
}))
