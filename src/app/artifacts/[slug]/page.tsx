import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Shield, Truck, Check, Minus, Plus, ShoppingCart, Heart, Share2, MapPin, Calendar } from 'lucide-react'
import { Button, Badge, Card } from '@/components/ui'
import { ArtifactGrid } from '@/components/artifacts'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, statusColors, authenticityLabels } from '@/lib/utils'
import { AddToCartButton } from './add-to-cart-button'
import type { Artifact } from '@/types'
import type { Metadata } from 'next'

interface PageProps {
    params: Promise<{ slug: string }>
}

async function getArtifact(slug: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('artifacts')
        .select('*, category:categories(*)')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

    return data as Artifact | null
}

async function getRelatedArtifacts(artifact: Artifact) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('artifacts')
        .select('*, category:categories(*)')
        .eq('is_active', true)
        .eq('category_id', artifact.category_id)
        .neq('id', artifact.id)
        .limit(4)

    return (data || []) as Artifact[]
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const artifact = await getArtifact(slug)

    if (!artifact) {
        return { title: 'Artifact Not Found' }
    }

    return {
        title: artifact.title,
        description: artifact.description || `Discover ${artifact.title} at HeritageKart`,
        openGraph: {
            title: artifact.title,
            description: artifact.description || undefined,
            images: artifact.images[0] ? [{ url: artifact.images[0] }] : undefined,
        },
    }
}

export default async function ArtifactDetailPage({ params }: PageProps) {
    const { slug } = await params
    const artifact = await getArtifact(slug)

    if (!artifact) {
        notFound()
    }

    const relatedArtifacts = await getRelatedArtifacts(artifact)
    const isOutOfStock = artifact.quantity <= 0

    return (
        <div className="min-h-screen pb-20">
            {/* Breadcrumb */}
            <div className="border-b border-stone-200 bg-stone-50 py-4 dark:border-stone-800 dark:bg-stone-900/50">
                <div className="mx-auto max-w-7xl px-4">
                    <nav className="flex items-center gap-2 text-sm text-stone-500">
                        <Link href="/" className="hover:text-amber-600">Home</Link>
                        <ChevronRight className="h-4 w-4" />
                        <Link href="/artifacts" className="hover:text-amber-600">Artifacts</Link>
                        {artifact.category && (
                            <>
                                <ChevronRight className="h-4 w-4" />
                                <Link href={`/artifacts?category=${artifact.category.slug}`} className="hover:text-amber-600">
                                    {artifact.category.name}
                                </Link>
                            </>
                        )}
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-stone-900 dark:text-white">{artifact.title}</span>
                    </nav>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="grid gap-12 lg:grid-cols-2">
                    {/* Images */}
                    <div className="space-y-4">
                        <div className="relative aspect-square overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-800">
                            <img
                                src={artifact.images[0] || '/placeholder.jpg'}
                                alt={artifact.title}
                                className="h-full w-full object-cover"
                            />
                            {artifact.authenticity_status === 'verified' && (
                                <div className="absolute left-4 top-4">
                                    <Badge variant="success" className="flex items-center gap-1 px-3 py-1.5">
                                        <Shield className="h-4 w-4" />
                                        Verified Authentic
                                    </Badge>
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Grid */}
                        {artifact.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-3">
                                {artifact.images.map((image, index) => (
                                    <button
                                        key={index}
                                        className="aspect-square overflow-hidden rounded-xl border-2 border-transparent bg-stone-100 transition-all hover:border-amber-500 dark:bg-stone-800"
                                    >
                                        <img
                                            src={image}
                                            alt={`${artifact.title} - Image ${index + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="space-y-6">
                        {/* Category */}
                        {artifact.category && (
                            <Link
                                href={`/artifacts?category=${artifact.category.slug}`}
                                className="inline-block text-sm font-medium uppercase tracking-wider text-amber-600 hover:text-amber-700"
                            >
                                {artifact.category.name}
                            </Link>
                        )}

                        {/* Title */}
                        <h1 className="text-3xl font-bold text-stone-900 dark:text-white lg:text-4xl">
                            {artifact.title}
                        </h1>

                        {/* Price */}
                        <div className="flex items-center gap-4">
                            <span className="text-3xl font-bold text-amber-600">
                                {formatPrice(artifact.price)}
                            </span>
                            {artifact.quantity > 0 && artifact.quantity <= 5 && (
                                <Badge variant="warning">Only {artifact.quantity} left</Badge>
                            )}
                            {isOutOfStock && <Badge variant="danger">Out of Stock</Badge>}
                        </div>

                        {/* Tags */}
                        {artifact.cultural_tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {artifact.cultural_tags.map((tag) => (
                                    <Badge key={tag} variant="secondary">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Description */}
                        <div className="prose prose-stone dark:prose-invert">
                            <p className="text-stone-600 dark:text-stone-400">
                                {artifact.description}
                            </p>
                        </div>

                        {/* Details Grid */}
                        <Card className="p-6">
                            <h3 className="mb-4 font-semibold text-stone-900 dark:text-white">
                                Artifact Details
                            </h3>
                            <dl className="grid gap-3 text-sm">
                                {artifact.origin_period && (
                                    <div className="flex items-center gap-3">
                                        <dt className="flex items-center gap-2 text-stone-500">
                                            <Calendar className="h-4 w-4" />
                                            Period:
                                        </dt>
                                        <dd className="font-medium text-stone-900 dark:text-white">
                                            {artifact.origin_period}
                                        </dd>
                                    </div>
                                )}
                                {artifact.origin_location && (
                                    <div className="flex items-center gap-3">
                                        <dt className="flex items-center gap-2 text-stone-500">
                                            <MapPin className="h-4 w-4" />
                                            Origin:
                                        </dt>
                                        <dd className="font-medium text-stone-900 dark:text-white">
                                            {artifact.origin_location}
                                        </dd>
                                    </div>
                                )}
                                {artifact.dimensions && (
                                    <div className="flex items-center gap-3">
                                        <dt className="text-stone-500">Dimensions:</dt>
                                        <dd className="font-medium text-stone-900 dark:text-white">
                                            {artifact.dimensions}
                                        </dd>
                                    </div>
                                )}
                                {artifact.material && (
                                    <div className="flex items-center gap-3">
                                        <dt className="text-stone-500">Material:</dt>
                                        <dd className="font-medium text-stone-900 dark:text-white">
                                            {artifact.material}
                                        </dd>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <dt className="text-stone-500">Authenticity:</dt>
                                    <dd>
                                        <Badge
                                            className={statusColors[artifact.authenticity_status]}
                                        >
                                            {authenticityLabels[artifact.authenticity_status]}
                                        </Badge>
                                    </dd>
                                </div>
                            </dl>
                        </Card>

                        {/* Add to Cart */}
                        <AddToCartButton artifact={artifact} />

                        {/* Features */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="flex items-center gap-3 rounded-xl bg-stone-50 p-4 dark:bg-stone-800">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                                    <Shield className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-stone-900 dark:text-white">
                                        Authenticity Certificate
                                    </p>
                                    <p className="text-xs text-stone-500">Included with purchase</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl bg-stone-50 p-4 dark:bg-stone-800">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                    <Truck className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-stone-900 dark:text-white">
                                        Secure Shipping
                                    </p>
                                    <p className="text-xs text-stone-500">Free above ₹2,000</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Artifacts */}
                {relatedArtifacts.length > 0 && (
                    <section className="mt-20">
                        <h2 className="mb-8 text-2xl font-bold text-stone-900 dark:text-white">
                            Related Artifacts
                        </h2>
                        <ArtifactGrid artifacts={relatedArtifacts} />
                    </section>
                )}
            </div>
        </div>
    )
}
