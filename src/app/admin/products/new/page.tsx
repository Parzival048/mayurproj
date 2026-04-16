'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import {
    Package,
    ArrowLeft,
    Upload,
    X,
    Plus,
    LayoutDashboard,
    ShoppingBag,
    Users
} from 'lucide-react'
import { Button, Input, Textarea, Select, Card, CardContent, Badge } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import type { Category } from '@/types'

const productSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    slug: z.string().min(3, 'Slug is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.coerce.number().min(1, 'Price must be greater than 0'),
    quantity: z.coerce.number().min(0, 'Quantity cannot be negative'),
    category_id: z.string().min(1, 'Category is required'),
    origin_period: z.string().optional(),
    origin_location: z.string().optional(),
    material: z.string().optional(),
    dimensions: z.string().optional(),
    authenticity_status: z.enum(['verified', 'pending', 'unverified']),
    is_featured: z.boolean(),
    is_active: z.boolean(),
})

type ProductFormData = z.infer<typeof productSchema>

export default function NewProductPage() {
    const router = useRouter()
    const supabase = createClient()
    const [isLoading, setIsLoading] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [images, setImages] = useState<string[]>([])
    const [tags, setTags] = useState<string[]>([])
    const [newTag, setNewTag] = useState('')

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<ProductFormData, unknown, ProductFormData>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            authenticity_status: 'pending',
            is_featured: false,
            is_active: true,
            quantity: 1,
        },
    })

    const title = watch('title')

    useEffect(() => {
        if (title) {
            setValue('slug', slugify(title))
        }
    }, [title, setValue])

    useEffect(() => {
        async function fetchCategories() {
            const { data } = await supabase.from('categories').select('*').order('name')
            setCategories((data || []) as Category[])
        }
        fetchCategories()
    }, [supabase])

    const addTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()])
            setNewTag('')
        }
    }

    const removeTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag))
    }

    const addImageUrl = () => {
        const url = prompt('Enter image URL:')
        if (url && url.trim()) {
            setImages([...images, url.trim()])
        }
    }

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index))
    }

    const onSubmit = async (data: ProductFormData) => {
        if (images.length === 0) {
            toast.error('Please add at least one image')
            return
        }

        setIsLoading(true)

        try {
            const { error } = await supabase.from('artifacts').insert({
                ...data,
                images,
                cultural_tags: tags,
            })

            if (error) throw error

            toast.success('Product created successfully!')
            router.push('/admin/products')
        } catch (error: any) {
            toast.error(error.message || 'Failed to create product')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-stone-50 pb-20 dark:bg-stone-950">
            {/* Header */}
            <div className="border-b border-stone-200 bg-white py-8 dark:border-stone-800 dark:bg-stone-900">
                <div className="mx-auto max-w-4xl px-4">
                    <Link
                        href="/admin/products"
                        className="mb-4 inline-flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Products
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-amber-500">
                            <Package className="h-5 w-5 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
                            Add New Product
                        </h1>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-4xl px-4 py-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Info */}
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="mb-4 text-lg font-semibold text-stone-900 dark:text-white">
                                Basic Information
                            </h2>

                            <div className="space-y-5">
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Input
                                        label="Product Title"
                                        placeholder="Ancient Bronze Sculpture"
                                        error={errors.title?.message}
                                        {...register('title')}
                                    />
                                    <Input
                                        label="Slug"
                                        placeholder="ancient-bronze-sculpture"
                                        error={errors.slug?.message}
                                        {...register('slug')}
                                    />
                                </div>

                                <Textarea
                                    label="Description"
                                    placeholder="Detailed description of the artifact..."
                                    error={errors.description?.message}
                                    {...register('description')}
                                />

                                <div className="grid gap-5 sm:grid-cols-3">
                                    <Input
                                        label="Price (₹)"
                                        type="number"
                                        placeholder="25000"
                                        error={errors.price?.message}
                                        {...register('price')}
                                    />
                                    <Input
                                        label="Quantity"
                                        type="number"
                                        placeholder="1"
                                        error={errors.quantity?.message}
                                        {...register('quantity')}
                                    />
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
                                            Category
                                        </label>
                                        <select
                                            {...register('category_id')}
                                            className="h-11 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-900"
                                        >
                                            <option value="">Select category</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category_id && (
                                            <p className="mt-1 text-sm text-red-500">{errors.category_id.message}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Images */}
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="mb-4 text-lg font-semibold text-stone-900 dark:text-white">
                                Images
                            </h2>

                            <div className="grid gap-4 sm:grid-cols-4">
                                {images.map((url, index) => (
                                    <div key={index} className="relative aspect-square overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-800">
                                        <img src={url} alt="" className="h-full w-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addImageUrl}
                                    className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 text-stone-400 transition-colors hover:border-amber-500 hover:text-amber-500"
                                >
                                    <Upload className="h-8 w-8" />
                                    <span className="text-sm">Add Image URL</span>
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Details */}
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="mb-4 text-lg font-semibold text-stone-900 dark:text-white">
                                Artifact Details
                            </h2>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <Input
                                    label="Origin Period"
                                    placeholder="e.g., 12th Century"
                                    error={errors.origin_period?.message}
                                    {...register('origin_period')}
                                />
                                <Input
                                    label="Origin Location"
                                    placeholder="e.g., Rajasthan, India"
                                    error={errors.origin_location?.message}
                                    {...register('origin_location')}
                                />
                                <Input
                                    label="Material"
                                    placeholder="e.g., Bronze, Wood, Marble"
                                    error={errors.material?.message}
                                    {...register('material')}
                                />
                                <Input
                                    label="Dimensions"
                                    placeholder="e.g., 30 x 20 x 15 cm"
                                    error={errors.dimensions?.message}
                                    {...register('dimensions')}
                                />
                            </div>

                            {/* Tags */}
                            <div className="mt-5">
                                <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
                                    Cultural Tags
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                            {tag}
                                            <button type="button" onClick={() => removeTag(tag)}>
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                            placeholder="Add tag..."
                                            className="h-8 rounded-lg border border-stone-200 bg-white px-3 text-sm dark:border-stone-700 dark:bg-stone-900"
                                        />
                                        <Button type="button" size="sm" variant="outline" onClick={addTag}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status */}
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="mb-4 text-lg font-semibold text-stone-900 dark:text-white">
                                Status & Visibility
                            </h2>

                            <div className="grid gap-5 sm:grid-cols-3">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
                                        Authenticity Status
                                    </label>
                                    <select
                                        {...register('authenticity_status')}
                                        className="h-11 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm dark:border-stone-700 dark:bg-stone-900"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="verified">Verified</option>
                                        <option value="unverified">Unverified</option>
                                    </select>
                                </div>

                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        {...register('is_featured')}
                                        className="h-5 w-5 rounded border-stone-300 text-amber-600"
                                    />
                                    <span className="text-sm text-stone-700 dark:text-stone-300">
                                        Featured Product
                                    </span>
                                </label>

                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        {...register('is_active')}
                                        className="h-5 w-5 rounded border-stone-300 text-amber-600"
                                    />
                                    <span className="text-sm text-stone-700 dark:text-stone-300">
                                        Active (Visible to customers)
                                    </span>
                                </label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Link href="/admin/products">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" isLoading={isLoading}>
                            Create Product
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
