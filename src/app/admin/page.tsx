import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Users,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Eye,
    Clock
} from 'lucide-react'
import { Card, CardContent, Badge } from '@/components/ui'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatDate, statusColors } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Admin Dashboard',
    description: 'HeritageKart Admin Dashboard',
}

async function getDashboardStats() {
    const supabase = await createClient()

    // Check admin access
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') redirect('/')

    // Get stats
    const [
        { count: totalUsers },
        { count: totalProducts },
        { count: totalOrders },
        { data: revenueData },
        { data: recentOrders },
        { data: orderStats },
    ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('artifacts').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total_amount'),
        supabase
            .from('orders')
            .select(`*, profile:profiles(full_name, email)`)
            .order('created_at', { ascending: false })
            .limit(5),
        supabase
            .from('orders')
            .select('status'),
    ])

    const totalRevenue = revenueData?.reduce((acc, order) => acc + Number(order.total_amount), 0) || 0

    const ordersByStatus = {
        pending: orderStats?.filter(o => o.status === 'pending').length || 0,
        processing: orderStats?.filter(o => o.status === 'processing').length || 0,
        shipped: orderStats?.filter(o => o.status === 'shipped').length || 0,
        delivered: orderStats?.filter(o => o.status === 'delivered').length || 0,
        cancelled: orderStats?.filter(o => o.status === 'cancelled').length || 0,
    }

    return {
        totalUsers: totalUsers || 0,
        totalProducts: totalProducts || 0,
        totalOrders: totalOrders || 0,
        totalRevenue,
        recentOrders: recentOrders || [],
        ordersByStatus,
    }
}

export default async function AdminDashboard() {
    const stats = await getDashboardStats()

    const statCards = [
        {
            title: 'Total Revenue',
            value: formatPrice(stats.totalRevenue),
            icon: TrendingUp,
            color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
            change: '+12.5%',
            trend: 'up',
        },
        {
            title: 'Total Orders',
            value: stats.totalOrders.toString(),
            icon: ShoppingBag,
            color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
            change: '+8.2%',
            trend: 'up',
        },
        {
            title: 'Total Products',
            value: stats.totalProducts.toString(),
            icon: Package,
            color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
            change: '+3',
            trend: 'up',
        },
        {
            title: 'Total Users',
            value: stats.totalUsers.toString(),
            icon: Users,
            color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
            change: '+15.3%',
            trend: 'up',
        },
    ]

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
                                Admin Dashboard
                            </h1>
                            <p className="text-sm text-stone-500">Welcome back, Admin</p>
                        </div>
                    </div>

                    {/* Admin Nav */}
                    <nav className="mt-6 flex gap-1">
                        {[
                            { href: '/admin', label: 'Overview', icon: LayoutDashboard },
                            { href: '/admin/products', label: 'Products', icon: Package },
                            { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
                            { href: '/admin/users', label: 'Users', icon: Users },
                        ].map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-white"
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Stats Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat) => (
                        <Card key={stat.title}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                                        <stat.icon className="h-6 w-6" />
                                    </div>
                                    <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {stat.change}
                                        {stat.trend === 'up' ? (
                                            <ArrowUpRight className="h-4 w-4" />
                                        ) : (
                                            <ArrowDownRight className="h-4 w-4" />
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <p className="text-2xl font-bold text-stone-900 dark:text-white">
                                        {stat.value}
                                    </p>
                                    <p className="text-sm text-stone-500">{stat.title}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-3">
                    {/* Recent Orders */}
                    <Card className="lg:col-span-2">
                        <CardContent className="p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-stone-900 dark:text-white">
                                    Recent Orders
                                </h2>
                                <Link
                                    href="/admin/orders"
                                    className="text-sm text-amber-600 hover:text-amber-700"
                                >
                                    View all
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-stone-100 text-left text-sm text-stone-500 dark:border-stone-800">
                                            <th className="pb-3 font-medium">Order</th>
                                            <th className="pb-3 font-medium">Customer</th>
                                            <th className="pb-3 font-medium">Status</th>
                                            <th className="pb-3 text-right font-medium">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {stats.recentOrders.map((order: any) => (
                                            <tr
                                                key={order.id}
                                                className="border-b border-stone-50 dark:border-stone-800/50"
                                            >
                                                <td className="py-3">
                                                    <p className="font-medium text-stone-900 dark:text-white">
                                                        #{order.order_number}
                                                    </p>
                                                    <p className="text-xs text-stone-500">
                                                        {formatDate(order.created_at)}
                                                    </p>
                                                </td>
                                                <td className="py-3 text-stone-600 dark:text-stone-400">
                                                    {order.profile?.full_name || order.profile?.email}
                                                </td>
                                                <td className="py-3">
                                                    <Badge className={statusColors[order.status]}>
                                                        {order.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 text-right font-medium text-stone-900 dark:text-white">
                                                    {formatPrice(order.total_amount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Status */}
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="mb-4 text-lg font-semibold text-stone-900 dark:text-white">
                                Orders by Status
                            </h2>

                            <div className="space-y-4">
                                {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                                    <div key={status} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Badge className={statusColors[status]}>
                                                <span className="capitalize">{status}</span>
                                            </Badge>
                                        </div>
                                        <span className="font-semibold text-stone-900 dark:text-white">
                                            {count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
