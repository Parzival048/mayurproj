import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Package, ChevronRight, Clock, Truck, CheckCircle, XCircle, Eye } from 'lucide-react'
import { Button, Badge, Card, CardContent } from '@/components/ui'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatDate, statusColors } from '@/lib/utils'
import type { Order, OrderItem } from '@/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'My Orders',
    description: 'View your order history and track shipments',
}

const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="h-4 w-4" />,
    processing: <Package className="h-4 w-4" />,
    shipped: <Truck className="h-4 w-4" />,
    delivered: <CheckCircle className="h-4 w-4" />,
    cancelled: <XCircle className="h-4 w-4" />,
}

async function getOrders() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login?redirect=/orders')
    }

    const { data } = await supabase
        .from('orders')
        .select(`
      *,
      order_items (
        *,
        artifact:artifacts(id, title, slug, images)
      )
    `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (data || []) as (Order & { order_items: OrderItem[] })[]
}

export default async function OrdersPage() {
    const orders = await getOrders()

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <div className="border-b border-stone-200 bg-gradient-to-br from-amber-50 to-white py-12 dark:border-stone-800 dark:from-stone-900 dark:to-stone-950">
                <div className="mx-auto max-w-4xl px-4">
                    <h1 className="text-3xl font-bold text-stone-900 dark:text-white">My Orders</h1>
                    <p className="mt-2 text-stone-600 dark:text-stone-400">
                        Track and manage your orders
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-4xl px-4 py-8">
                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Package className="mb-4 h-16 w-16 text-stone-300" />
                        <h2 className="text-xl font-semibold text-stone-900 dark:text-white">
                            No orders yet
                        </h2>
                        <p className="mt-2 text-stone-600 dark:text-stone-400">
                            Start exploring our collection
                        </p>
                        <Link href="/artifacts">
                            <Button className="mt-6">Browse Artifacts</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <Card key={order.id}>
                                <CardContent className="p-6">
                                    {/* Order Header */}
                                    <div className="flex flex-col gap-4 border-b border-stone-100 pb-4 dark:border-stone-800 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-semibold text-stone-900 dark:text-white">
                                                    Order #{order.order_number}
                                                </h3>
                                                <Badge className={statusColors[order.status]}>
                                                    {statusIcons[order.status]}
                                                    <span className="ml-1 capitalize">{order.status}</span>
                                                </Badge>
                                            </div>
                                            <p className="mt-1 text-sm text-stone-500">
                                                Placed on {formatDate(order.created_at)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-amber-600">
                                                {formatPrice(order.total_amount)}
                                            </p>
                                            <p className="text-sm text-stone-500">
                                                {order.order_items?.length || 0} items
                                            </p>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="mt-4 space-y-3">
                                        {order.order_items?.slice(0, 3).map((item) => (
                                            <div key={item.id} className="flex items-center gap-4">
                                                <img
                                                    src={item.artifact_image || '/placeholder.jpg'}
                                                    alt={item.artifact_title}
                                                    className="h-14 w-14 rounded-lg object-cover"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="truncate font-medium text-stone-900 dark:text-white">
                                                        {item.artifact_title}
                                                    </p>
                                                    <p className="text-sm text-stone-500">
                                                        Qty: {item.quantity} × {formatPrice(item.price_at_time)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {order.order_items && order.order_items.length > 3 && (
                                            <p className="text-sm text-stone-500">
                                                +{order.order_items.length - 3} more items
                                            </p>
                                        )}
                                    </div>

                                    {/* Shipping Address */}
                                    <div className="mt-4 rounded-lg bg-stone-50 p-4 dark:bg-stone-800">
                                        <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
                                            Shipping to
                                        </p>
                                        <p className="mt-1 text-sm text-stone-700 dark:text-stone-300">
                                            {order.shipping_address.full_name}
                                            <br />
                                            {order.shipping_address.street}, {order.shipping_address.city}
                                            <br />
                                            {order.shipping_address.state} - {order.shipping_address.postal_code}
                                        </p>
                                    </div>

                                    {/* Order Timeline */}
                                    <div className="mt-4">
                                        <OrderTimeline status={order.status} />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function OrderTimeline({ status }: { status: string }) {
    const steps = ['pending', 'processing', 'shipped', 'delivered']
    const currentIndex = status === 'cancelled' ? -1 : steps.indexOf(status)

    return (
        <div className="flex items-center justify-between">
            {steps.map((step, index) => (
                <div key={step} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center">
                        <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${index <= currentIndex
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-stone-200 text-stone-500 dark:bg-stone-700'
                                }`}
                        >
                            {statusIcons[step]}
                        </div>
                        <span className="mt-1 text-xs capitalize text-stone-500">{step}</span>
                    </div>
                    {index < steps.length - 1 && (
                        <div
                            className={`h-0.5 flex-1 ${index < currentIndex
                                    ? 'bg-amber-600'
                                    : 'bg-stone-200 dark:bg-stone-700'
                                }`}
                        />
                    )}
                </div>
            ))}
        </div>
    )
}
