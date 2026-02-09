'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
    ShoppingBag,
    Search,
    LayoutDashboard,
    Package,
    Users,
    Eye
} from 'lucide-react'
import { Button, Badge, Card, CardContent, Select } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate, statusColors } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Order } from '@/types'

export default function AdminOrdersPage() {
    const supabase = createClient()
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('')

    useEffect(() => {
        fetchOrders()
    }, [])

    async function fetchOrders() {
        setIsLoading(true)
        const { data } = await supabase
            .from('orders')
            .select(`*, profile:profiles(full_name, email), order_items(count)`)
            .order('created_at', { ascending: false })

        setOrders((data || []) as any)
        setIsLoading(false)
    }

    async function updateOrderStatus(orderId: string, status: string) {
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId)

        if (error) {
            toast.error('Failed to update order status')
        } else {
            setOrders(prev =>
                prev.map(o => (o.id === orderId ? { ...o, status: status as any } : o))
            )
            toast.success('Order status updated')
        }
    }

    const filteredOrders = orders.filter(o => {
        const matchesSearch = o.order_number.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = !statusFilter || o.status === statusFilter
        return matchesSearch && matchesStatus
    })

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
                                Orders Management
                            </h1>
                            <p className="text-sm text-stone-500">{orders.length} orders total</p>
                        </div>
                    </div>

                    {/* Admin Nav */}
                    <nav className="mt-6 flex gap-1">
                        {[
                            { href: '/admin', label: 'Overview', icon: LayoutDashboard },
                            { href: '/admin/products', label: 'Products', icon: Package },
                            { href: '/admin/orders', label: 'Orders', icon: ShoppingBag, active: true },
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
                            placeholder="Search by order number..."
                            className="h-10 w-full rounded-lg border border-stone-200 bg-white pl-10 pr-4 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-900"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-10 rounded-lg border border-stone-200 bg-white px-4 text-sm dark:border-stone-700 dark:bg-stone-900"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {/* Orders Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-stone-100 bg-stone-50 text-left text-sm text-stone-500 dark:border-stone-800 dark:bg-stone-900">
                                        <th className="px-6 py-4 font-medium">Order</th>
                                        <th className="px-6 py-4 font-medium">Customer</th>
                                        <th className="px-6 py-4 font-medium">Date</th>
                                        <th className="px-6 py-4 font-medium">Total</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {filteredOrders.map((order: any) => (
                                        <tr
                                            key={order.id}
                                            className="border-b border-stone-50 dark:border-stone-800/50"
                                        >
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-stone-900 dark:text-white">
                                                    #{order.order_number}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-stone-900 dark:text-white">
                                                    {order.profile?.full_name || 'N/A'}
                                                </p>
                                                <p className="text-xs text-stone-500">
                                                    {order.profile?.email}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-stone-600 dark:text-stone-400">
                                                {formatDate(order.created_at)}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-stone-900 dark:text-white">
                                                {formatPrice(order.total_amount)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                    className={`rounded-lg border-0 py-1 pl-2 pr-8 text-xs font-medium ${statusColors[order.status]}`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link href={`/admin/orders/${order.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                        View
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
