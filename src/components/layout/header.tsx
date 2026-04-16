'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    ShoppingCart,
    User,
    Menu,
    X,
    LogOut,
    Package,
    Heart,
    Settings,
    LayoutDashboard,
} from 'lucide-react'
import { Button } from '@/components/ui'
import { cn, formatPrice } from '@/lib/utils'
import { useCartStore, useAuthStore, useUIStore } from '@/lib/store'
import { createClient } from '@/lib/supabase/client'

const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/artifacts', label: 'Artifacts' },
]

export function Header() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const { user, isLoading, setUser } = useAuthStore()
    const { items, isOpen, toggleCart, getTotalItems } = useCartStore()
    const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore()

    const [isScrolled, setIsScrolled] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [mounted, setMounted] = useState(false)

    // Prevent hydration mismatch - only show cart count after mount
    useEffect(() => {
        setMounted(true)
    }, [])

    // Track scroll
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setShowUserMenu(false)
        router.push('/')
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/artifacts?search=${encodeURIComponent(searchQuery.trim())}`)
            setSearchQuery('')
        }
    }

    return (
        <>
            <header
                className={cn(
                    'fixed left-0 right-0 top-0 z-50 transition-all duration-300',
                    isScrolled
                        ? 'bg-white/90 shadow-lg backdrop-blur-xl dark:bg-stone-950/90'
                        : 'bg-transparent'
                )}
            >
                {/* Top bar */}
                <div className="border-b border-amber-200/20 bg-gradient-to-r from-amber-800 to-amber-600 px-4 py-2 text-center text-sm text-white">
                    ✨ Free shipping on orders above ₹2,000 | Authentic artifacts with certificate
                </div>

                <div className="mx-auto max-w-7xl px-4">
                    <div className="flex h-20 items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-amber-500">
                                <span className="text-xl font-bold text-white">H</span>
                            </div>
                            <span className="text-xl font-bold text-stone-900 dark:text-white">
                                Heritage<span className="text-amber-600">Kart</span>
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden items-center gap-8 lg:flex">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        'relative text-sm font-medium transition-colors',
                                        pathname === link.href
                                            ? 'text-amber-600'
                                            : 'text-stone-600 hover:text-amber-600 dark:text-stone-300'
                                    )}
                                >
                                    {link.label}
                                    {pathname === link.href && (
                                        <motion.div
                                            layoutId="navIndicator"
                                            className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-amber-600"
                                        />
                                    )}
                                </Link>
                            ))}
                        </nav>

                        {/* Search & Actions */}
                        <div className="flex items-center gap-3">
                            {/* Search */}
                            <form onSubmit={handleSearch} className="relative hidden md:block">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search artifacts..."
                                    className="h-10 w-64 rounded-full border border-stone-200 bg-stone-50 pl-10 pr-4 text-sm transition-all focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                                />
                            </form>

                            {/* Cart */}
                            <button
                                onClick={toggleCart}
                                className="relative rounded-full p-2 text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                            >
                                <ShoppingCart className="h-5 w-5" />
                                {mounted && getTotalItems() > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-xs font-medium text-white">
                                        {getTotalItems()}
                                    </span>
                                )}
                            </button>

                            {/* User Menu */}
                            {isLoading ? (
                                <Button size="sm" variant="outline" disabled>
                                    Loading...
                                </Button>
                            ) : user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-2 rounded-full bg-stone-100 p-1 pr-3 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-amber-500 text-sm font-medium text-white">
                                            {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                        </div>
                                        <span className="hidden text-sm font-medium text-stone-700 dark:text-stone-200 md:block">
                                            {user.full_name || 'Account'}
                                        </span>
                                    </button>

                                    <AnimatePresence>
                                        {showUserMenu && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-stone-200 bg-white p-2 shadow-xl dark:border-stone-700 dark:bg-stone-800"
                                            >
                                                <div className="border-b border-stone-100 px-3 py-2 dark:border-stone-700">
                                                    <p className="text-sm font-medium text-stone-900 dark:text-white">
                                                        {user.full_name || 'User'}
                                                    </p>
                                                    <p className="text-xs text-stone-500">{user.email}</p>
                                                </div>

                                                <div className="mt-2 space-y-1">
                                                    <Link
                                                        href="/orders"
                                                        onClick={() => setShowUserMenu(false)}
                                                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-700"
                                                    >
                                                        <Package className="h-4 w-4" />
                                                        My Orders
                                                    </Link>
                                                    <Link
                                                        href="/profile"
                                                        onClick={() => setShowUserMenu(false)}
                                                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-700"
                                                    >
                                                        <Settings className="h-4 w-4" />
                                                        Profile
                                                    </Link>
                                                    {user.role === 'admin' && (
                                                        <Link
                                                            href="/admin"
                                                            onClick={() => setShowUserMenu(false)}
                                                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-amber-600 transition-colors hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950"
                                                        >
                                                            <LayoutDashboard className="h-4 w-4" />
                                                            Admin Dashboard
                                                        </Link>
                                                    )}
                                                </div>

                                                <div className="mt-2 border-t border-stone-100 pt-2 dark:border-stone-700">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                                                    >
                                                        <LogOut className="h-4 w-4" />
                                                        Logout
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <Link href="/login">
                                    <Button size="sm">Sign In</Button>
                                </Link>
                            )}

                            {/* Mobile menu toggle */}
                            <button
                                onClick={toggleMobileMenu}
                                className="rounded-lg p-2 text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 lg:hidden"
                            >
                                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900 lg:hidden"
                        >
                            <div className="space-y-1 px-4 py-4">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={closeMobileMenu}
                                        className={cn(
                                            'block rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                                            pathname === link.href
                                                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                                                : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
                                        )}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Cart Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={toggleCart}
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-md border-l border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-900"
                        >
                            <div className="flex h-full flex-col">
                                <div className="flex items-center justify-between border-b border-stone-200 p-6 dark:border-stone-800">
                                    <h2 className="text-xl font-semibold text-stone-900 dark:text-white">
                                        Shopping Cart ({getTotalItems()})
                                    </h2>
                                    <button
                                        onClick={toggleCart}
                                        className="rounded-lg p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6">
                                    {items.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <ShoppingCart className="mb-4 h-16 w-16 text-stone-300" />
                                            <p className="text-lg font-medium text-stone-600 dark:text-stone-400">
                                                Your cart is empty
                                            </p>
                                            <p className="mt-1 text-sm text-stone-500">
                                                Start exploring our collection
                                            </p>
                                            <Link href="/artifacts">
                                                <Button className="mt-4" onClick={toggleCart}>
                                                    Browse Artifacts
                                                </Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {items.map((item) => (
                                                <CartItemCard key={item.id} item={item} />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {items.length > 0 && (
                                    <div className="border-t border-stone-200 p-6 dark:border-stone-800">
                                        <div className="mb-4 flex items-center justify-between">
                                            <span className="text-lg font-medium text-stone-900 dark:text-white">
                                                Subtotal
                                            </span>
                                            <span className="text-xl font-bold text-amber-600">
                                                {formatPrice(useCartStore.getState().getTotalPrice())}
                                            </span>
                                        </div>
                                        <Link href="/checkout" onClick={toggleCart}>
                                            <Button className="w-full" size="lg">
                                                Proceed to Checkout
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Spacer for fixed header */}
            <div className="h-28" />
        </>
    )
}

function CartItemCard({ item }: { item: CartItem & { artifact: Artifact } }) {
    const { updateQuantity, removeItem } = useCartStore()

    return (
        <div className="flex gap-4 rounded-xl bg-stone-50 p-3 dark:bg-stone-800">
            <img
                src={item.artifact.images[0] || '/placeholder.jpg'}
                alt={item.artifact.title}
                className="h-20 w-20 rounded-lg object-cover"
            />
            <div className="flex flex-1 flex-col">
                <h3 className="line-clamp-1 text-sm font-medium text-stone-900 dark:text-white">
                    {item.artifact.title}
                </h3>
                <p className="text-sm font-semibold text-amber-600">
                    {formatPrice(item.artifact.price)}
                </p>
                <div className="mt-auto flex items-center gap-2">
                    <button
                        onClick={() => updateQuantity(item.artifact_id, item.quantity - 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-200 text-stone-600 transition-colors hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-300"
                    >
                        -
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                        onClick={() => updateQuantity(item.artifact_id, item.quantity + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-200 text-stone-600 transition-colors hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-300"
                    >
                        +
                    </button>
                    <button
                        onClick={() => removeItem(item.artifact_id)}
                        className="ml-auto text-red-500 transition-colors hover:text-red-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}

// Import Artifact type for CartItemCard
import type { CartItem, Artifact } from '@/types'
