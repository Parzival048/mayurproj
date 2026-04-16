'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    Package,
    Plus,
    Search,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    LayoutDashboard,
    ShoppingBag,
    Users
} from 'lucide-react'
import { Button, Badge, Card, CardContent, Modal, Input } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate, statusColors } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Artifact, Category } from '@/types'

export default function AdminProductsPage() {
    const router = useRouter()
    const supabase = createClient()
    const [artifacts, setArtifacts] = useState<Artifact[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; artifact: Artifact | null }>({
        open: false,
        artifact: null,
    })

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        setIsLoading(true)
        const [artifactsRes, categoriesRes] = await Promise.all([
            supabase
                .from('artifacts')
                .select('*, category:categories(*)')
                .order('created_at', { ascending: false }),
            supabase.from('categories').select('*'),
        ])

        setArtifacts((artifactsRes.data || []) as Artifact[])
        setCategories(categoriesRes.data || [])
        setIsLoading(false)
    }

    async function handleDelete() {
        if (!deleteModal.artifact) return

        const { error } = await supabase
            .from('artifacts')
            .delete()
            .eq('id', deleteModal.artifact.id)

        if (error) {
            toast.error('Failed to delete product')
        } else {
            toast.success('Product deleted')
            setArtifacts(prev => prev.filter(a => a.id !== deleteModal.artifact?.id))
        }

        setDeleteModal({ open: false, artifact: null })
    }

    async function toggleActive(artifact: Artifact) {
        const { error } = await supabase
            .from('artifacts')
            .update({ is_active: !artifact.is_active })
            .eq('id', artifact.id)

        if (error) {
            toast.error('Failed to update product')
        } else {
            setArtifacts(prev =>
                prev.map(a => (a.id === artifact.id ? { ...a, is_active: !a.is_active } : a))
            )
            toast.success(artifact.is_active ? 'Product deactivated' : 'Product activated')
        }
    }

    const filteredArtifacts = artifacts.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-stone-50 pb-20 dark:bg-stone-950">
            {/* Header */}
            <div className="border-b border-stone-200 bg-white py-8 dark:border-stone-800 dark:bg-stone-900">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-amber-500">
                            <LayoutDashboard className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
                                Products Management
                            </h1>
                            <p className="text-sm text-stone-500">{artifacts.length} products total</p>
                        </div>
                    </div>

                    {/* Admin Nav */}
                    <nav className="mt-6 flex gap-1">
                        {[
                            { href: '/admin', label: 'Overview', icon: LayoutDashboard },
                            { href: '/admin/products', label: 'Products', icon: Package, active: true },
                            { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
                            { href: '/admin/users', label: 'Users', icon: Users },
                        ].map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${item.active
                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                        : 'text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800'
                                    }`}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Controls */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative max-w-sm flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search products..."
                            className="h-10 w-full rounded-lg border border-stone-200 bg-white pl-10 pr-4 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-900"
                        />
                    </div>

                    <Link href="/admin/products/new">
                        <Button>
                            <Plus className="h-4 w-4" />
                            Add Product
                        </Button>
                    </Link>
                </div>

                {/* Products Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-stone-100 bg-stone-50 text-left text-sm text-stone-500 dark:border-stone-800 dark:bg-stone-900">
                                        <th className="px-6 py-4 font-medium">Product</th>
                                        <th className="px-6 py-4 font-medium">Category</th>
                                        <th className="px-6 py-4 font-medium">Price</th>
                                        <th className="px-6 py-4 font-medium">Stock</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {filteredArtifacts.map((artifact) => (
                                        <tr
                                            key={artifact.id}
                                            className="border-b border-stone-50 dark:border-stone-800/50"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={artifact.images[0] || '/placeholder.jpg'}
                                                        alt={artifact.title}
                                                        className="h-12 w-12 rounded-lg object-cover"
                                                    />
                                                    <div>
                                                        <p className="font-medium text-stone-900 dark:text-white">
                                                            {artifact.title}
                                                        </p>
                                                        <p className="text-xs text-stone-500">
                                                            {artifact.authenticity_status === 'verified' && '✓ Verified'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-stone-600 dark:text-stone-400">
                                                {artifact.category?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-stone-900 dark:text-white">
                                                {formatPrice(artifact.price)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={artifact.quantity <= 5 ? 'text-red-600' : 'text-stone-600 dark:text-stone-400'}>
                                                    {artifact.quantity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button onClick={() => toggleActive(artifact)}>
                                                    <Badge variant={artifact.is_active ? 'success' : 'secondary'}>
                                                        {artifact.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Link href={`/artifacts/${artifact.slug}`}>
                                                        <Button variant="ghost" size="icon">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/admin/products/${artifact.id}/edit`}>
                                                        <Button variant="ghost" size="icon">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setDeleteModal({ open: true, artifact })}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Delete Modal */}
            <Modal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, artifact: null })}
                title="Delete Product"
            >
                <p className="text-stone-600 dark:text-stone-400">
                    Are you sure you want to delete <strong>{deleteModal.artifact?.title}</strong>? This action cannot be undone.
                </p>
                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setDeleteModal({ open: false, artifact: null })}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                        Delete
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
