'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShoppingCart, Check, Eye } from 'lucide-react'
import { Button, Badge, Card } from '@/components/ui'
import { cn, formatPrice, authenticityLabels, statusColors } from '@/lib/utils'
import { useCartStore } from '@/lib/store'
import type { Artifact } from '@/types'

interface ArtifactCardProps {
    artifact: Artifact
    priority?: boolean
}

export function ArtifactCard({ artifact, priority = false }: ArtifactCardProps) {
    const { addItem, openCart } = useCartStore()
    const isOutOfStock = artifact.quantity <= 0

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!isOutOfStock) {
            addItem(artifact)
            openCart()
        }
    }

    return (
        <Link href={`/artifacts/${artifact.slug}`}>
            <Card
                hover
                className="group relative overflow-hidden"
            >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-stone-100 dark:bg-stone-800">
                    <img
                        src={artifact.images[0] || '/placeholder.jpg'}
                        alt={artifact.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    {/* Quick Actions */}
                    <div className="absolute bottom-4 left-4 right-4 flex translate-y-4 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <Button
                            size="sm"
                            className="flex-1"
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                        >
                            <ShoppingCart className="h-4 w-4" />
                            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                        <Button size="icon" variant="secondary" className="flex-shrink-0">
                            <Eye className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Badges */}
                    <div className="absolute left-3 top-3 flex flex-col gap-2">
                        {artifact.is_featured && (
                            <Badge className="bg-gradient-to-r from-amber-600 to-amber-500 text-white">
                                Featured
                            </Badge>
                        )}
                        {artifact.authenticity_status === 'verified' && (
                            <Badge variant="success" className="flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                Verified
                            </Badge>
                        )}
                        {isOutOfStock && (
                            <Badge variant="danger">Out of Stock</Badge>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* Category */}
                    {artifact.category && (
                        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-amber-600">
                            {artifact.category.name}
                        </p>
                    )}

                    {/* Title */}
                    <h3 className="line-clamp-2 text-base font-semibold text-stone-900 transition-colors group-hover:text-amber-600 dark:text-white">
                        {artifact.title}
                    </h3>

                    {/* Tags */}
                    {artifact.cultural_tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                            {artifact.cultural_tags.slice(0, 2).map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Price */}
                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-lg font-bold text-amber-600">
                            {formatPrice(artifact.price)}
                        </span>
                        {artifact.quantity > 0 && artifact.quantity <= 5 && (
                            <span className="text-xs text-orange-600">
                                Only {artifact.quantity} left
                            </span>
                        )}
                    </div>
                </div>
            </Card>
        </Link>
    )
}

interface ArtifactGridProps {
    artifacts: Artifact[]
    className?: string
}

export function ArtifactGrid({ artifacts, className }: ArtifactGridProps) {
    return (
        <div className={cn('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', className)}>
            {artifacts.map((artifact, index) => (
                <motion.div
                    key={artifact.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                    <ArtifactCard artifact={artifact} priority={index < 4} />
                </motion.div>
            ))}
        </div>
    )
}
