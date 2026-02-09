'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Minus, Plus, ShoppingCart, Heart, Share2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { useCartStore, useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'
import type { Artifact } from '@/types'

interface AddToCartButtonProps {
    artifact: Artifact
}

export function AddToCartButton({ artifact }: AddToCartButtonProps) {
    const router = useRouter()
    const { user } = useAuthStore()
    const { addItem, openCart } = useCartStore()
    const [quantity, setQuantity] = useState(1)
    const isOutOfStock = artifact.quantity <= 0

    const handleAddToCart = () => {
        if (isOutOfStock) return

        addItem(artifact, quantity)
        toast.success('Added to cart!')
        openCart()
    }

    const handleBuyNow = () => {
        if (isOutOfStock) return

        addItem(artifact, quantity)

        if (!user) {
            router.push('/login?redirect=/checkout')
        } else {
            router.push('/checkout')
        }
    }

    const incrementQuantity = () => {
        if (quantity < artifact.quantity) {
            setQuantity(q => q + 1)
        }
    }

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(q => q - 1)
        }
    }

    return (
        <div className="space-y-4">
            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                    Quantity:
                </span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={decrementQuantity}
                        disabled={quantity <= 1 || isOutOfStock}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 text-stone-600 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center text-lg font-semibold text-stone-900 dark:text-white">
                        {quantity}
                    </span>
                    <button
                        onClick={incrementQuantity}
                        disabled={quantity >= artifact.quantity || isOutOfStock}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 text-stone-600 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                    size="lg"
                    className="flex-1"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                >
                    <ShoppingCart className="h-5 w-5" />
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </Button>
                <Button
                    size="lg"
                    variant="outline"
                    className="flex-1"
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                >
                    Buy Now
                </Button>
            </div>

            {/* Wishlist & Share */}
            <div className="flex gap-3">
                <Button variant="ghost" className="flex-1">
                    <Heart className="h-4 w-4" />
                    Add to Wishlist
                </Button>
                <Button variant="ghost" className="flex-1">
                    <Share2 className="h-4 w-4" />
                    Share
                </Button>
            </div>
        </div>
    )
}
