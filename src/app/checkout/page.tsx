'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { ChevronRight, ShoppingBag, MapPin, CreditCard, Check, Truck, Loader2 } from 'lucide-react'
import { Button, Input, Card, CardContent, Textarea } from '@/components/ui'
import { useCartStore, useAuthStore } from '@/lib/store'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'

const addressSchema = z.object({
    fullName: z.string().min(2, 'Name is required'),
    phone: z.string().min(10, 'Valid phone number is required'),
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    postalCode: z.string().min(6, 'Valid postal code is required'),
    notes: z.string().optional(),
})

type AddressFormData = z.infer<typeof addressSchema>

export default function CheckoutPage() {
    const router = useRouter()
    const supabase = createClient()
    const { user } = useAuthStore()
    const { items, getTotalPrice, clearCart } = useCartStore()
    const [step, setStep] = useState<'address' | 'review' | 'confirm'>('address')
    const [isLoading, setIsLoading] = useState(false)
    const [shippingAddress, setShippingAddress] = useState<AddressFormData | null>(null)
    const [mounted, setMounted] = useState(false)

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AddressFormData>({
        resolver: zodResolver(addressSchema) as any,
        defaultValues: {
            fullName: user?.full_name || '',
            phone: user?.phone || '',
        },
    })

    const subtotal = getTotalPrice()
    const shipping = subtotal >= 2000 ? 0 : 150
    const total = subtotal + shipping

    const onAddressSubmit = (data: AddressFormData) => {
        setShippingAddress(data)
        setStep('review')
    }

    const handlePlaceOrder = async () => {
        if (!shippingAddress || !user) return

        setIsLoading(true)

        try {
            // Create order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    shipping_address: {
                        full_name: shippingAddress.fullName,
                        phone: shippingAddress.phone,
                        street: shippingAddress.street,
                        city: shippingAddress.city,
                        state: shippingAddress.state,
                        postal_code: shippingAddress.postalCode,
                        country: 'India',
                    },
                    total_amount: total,
                    payment_method: 'cod',
                    notes: shippingAddress.notes,
                })
                .select()
                .single()

            if (orderError) throw orderError

            // Create order items
            const orderItems = items.map(item => ({
                order_id: order.id,
                artifact_id: item.artifact_id,
                artifact_title: item.artifact.title,
                artifact_image: item.artifact.images[0] || null,
                quantity: item.quantity,
                price_at_time: item.artifact.price,
            }))

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems)

            if (itemsError) throw itemsError

            // Clear cart items from database
            await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', user.id)

            // Clear local cart
            clearCart()

            setStep('confirm')
            toast.success('Order placed successfully!')

            // Redirect to orders after a delay
            setTimeout(() => {
                router.push('/orders')
            }, 3000)
        } catch (error) {
            console.error('Error placing order:', error)
            toast.error('Failed to place order. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    // Show loading while hydrating
    if (!mounted) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            </div>
        )
    }

    if (items.length === 0 && step !== 'confirm') {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20">
                <ShoppingBag className="mb-4 h-16 w-16 text-stone-300" />
                <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
                    Your cart is empty
                </h1>
                <p className="mt-2 text-stone-600 dark:text-stone-400">
                    Add some artifacts to get started
                </p>
                <Link href="/artifacts">
                    <Button className="mt-6">Browse Artifacts</Button>
                </Link>
            </div>
        )
    }

    // Order Confirmed
    if (step === 'confirm') {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <Check className="h-10 w-10 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
                    Order Placed Successfully!
                </h1>
                <p className="mt-2 text-center text-stone-600 dark:text-stone-400">
                    Thank you for your order. You&apos;ll receive a confirmation email shortly.
                </p>
                <p className="mt-4 text-sm text-stone-500">
                    Redirecting to your orders...
                </p>
            </div>
        )
    }

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <div className="border-b border-stone-200 bg-stone-50 py-8 dark:border-stone-800 dark:bg-stone-900/50">
                <div className="mx-auto max-w-4xl px-4">
                    <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
                        Checkout
                    </h1>

                    {/* Steps */}
                    <div className="mt-6 flex items-center gap-4">
                        <div className={`flex items-center gap-2 ${step === 'address' ? 'text-amber-600' : 'text-green-600'}`}>
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step === 'address' ? 'bg-amber-600' : 'bg-green-600'
                                } text-white`}>
                                {step === 'address' ? '1' : <Check className="h-4 w-4" />}
                            </div>
                            <span className="text-sm font-medium">Shipping</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-stone-400" />
                        <div className={`flex items-center gap-2 ${step === 'review' ? 'text-amber-600' : 'text-stone-400'}`}>
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step === 'review' ? 'bg-amber-600 text-white' : 'bg-stone-200 dark:bg-stone-700'
                                }`}>
                                2
                            </div>
                            <span className="text-sm font-medium">Review</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-4xl px-4 py-8">
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Form / Review */}
                    <div className="lg:col-span-2">
                        {step === 'address' && (
                            <Card>
                                <CardContent className="p-6">
                                    <div className="mb-6 flex items-center gap-3">
                                        <MapPin className="h-5 w-5 text-amber-600" />
                                        <h2 className="text-lg font-semibold text-stone-900 dark:text-white">
                                            Shipping Address
                                        </h2>
                                    </div>

                                    <form onSubmit={handleSubmit(onAddressSubmit)} className="space-y-5">
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <Input
                                                label="Full Name"
                                                placeholder="John Doe"
                                                error={errors.fullName?.message}
                                                {...register('fullName')}
                                            />
                                            <Input
                                                label="Phone Number"
                                                placeholder="+91 98765 43210"
                                                error={errors.phone?.message}
                                                {...register('phone')}
                                            />
                                        </div>

                                        <Input
                                            label="Street Address"
                                            placeholder="123 Main St, Apt 4B"
                                            error={errors.street?.message}
                                            {...register('street')}
                                        />

                                        <div className="grid gap-5 sm:grid-cols-3">
                                            <Input
                                                label="City"
                                                placeholder="Mumbai"
                                                error={errors.city?.message}
                                                {...register('city')}
                                            />
                                            <Input
                                                label="State"
                                                placeholder="Maharashtra"
                                                error={errors.state?.message}
                                                {...register('state')}
                                            />
                                            <Input
                                                label="Postal Code"
                                                placeholder="400001"
                                                error={errors.postalCode?.message}
                                                {...register('postalCode')}
                                            />
                                        </div>

                                        <Textarea
                                            label="Order Notes (Optional)"
                                            placeholder="Any special instructions for delivery..."
                                            {...register('notes')}
                                        />

                                        <Button type="submit" className="w-full" size="lg">
                                            Continue to Review
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {step === 'review' && shippingAddress && (
                            <div className="space-y-6">
                                {/* Shipping Address Review */}
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="mb-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <MapPin className="h-5 w-5 text-amber-600" />
                                                <h2 className="text-lg font-semibold text-stone-900 dark:text-white">
                                                    Shipping Address
                                                </h2>
                                            </div>
                                            <button
                                                onClick={() => setStep('address')}
                                                className="text-sm text-amber-600 hover:text-amber-700"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                        <div className="text-sm text-stone-600 dark:text-stone-400">
                                            <p className="font-medium text-stone-900 dark:text-white">
                                                {shippingAddress.fullName}
                                            </p>
                                            <p>{shippingAddress.phone}</p>
                                            <p>{shippingAddress.street}</p>
                                            <p>
                                                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Order Items */}
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="mb-4 flex items-center gap-3">
                                            <ShoppingBag className="h-5 w-5 text-amber-600" />
                                            <h2 className="text-lg font-semibold text-stone-900 dark:text-white">
                                                Order Items ({items.length})
                                            </h2>
                                        </div>
                                        <div className="divide-y divide-stone-100 dark:divide-stone-800">
                                            {items.map((item) => (
                                                <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                                                    <img
                                                        src={item.artifact.images[0] || '/placeholder.jpg'}
                                                        alt={item.artifact.title}
                                                        className="h-16 w-16 rounded-lg object-cover"
                                                    />
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-stone-900 dark:text-white">
                                                            {item.artifact.title}
                                                        </h3>
                                                        <p className="text-sm text-stone-500">Qty: {item.quantity}</p>
                                                    </div>
                                                    <p className="font-medium text-stone-900 dark:text-white">
                                                        {formatPrice(item.artifact.price * item.quantity)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Payment Method */}
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="mb-4 flex items-center gap-3">
                                            <CreditCard className="h-5 w-5 text-amber-600" />
                                            <h2 className="text-lg font-semibold text-stone-900 dark:text-white">
                                                Payment Method
                                            </h2>
                                        </div>
                                        <label className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-amber-500 bg-amber-50 p-4 dark:bg-amber-900/20">
                                            <input
                                                type="radio"
                                                name="payment"
                                                checked
                                                readOnly
                                                className="h-4 w-4 text-amber-600"
                                            />
                                            <div>
                                                <p className="font-medium text-stone-900 dark:text-white">
                                                    Cash on Delivery (COD)
                                                </p>
                                                <p className="text-sm text-stone-500">
                                                    Pay when you receive your order
                                                </p>
                                            </div>
                                        </label>
                                    </CardContent>
                                </Card>

                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handlePlaceOrder}
                                    isLoading={isLoading}
                                >
                                    Place Order
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div>
                        <Card className="sticky top-32">
                            <CardContent className="p-6">
                                <h2 className="mb-4 text-lg font-semibold text-stone-900 dark:text-white">
                                    Order Summary
                                </h2>

                                <div className="space-y-3 border-b border-stone-100 pb-4 dark:border-stone-800">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-stone-600 dark:text-stone-400">
                                            Subtotal ({items.length} items)
                                        </span>
                                        <span className="font-medium text-stone-900 dark:text-white">
                                            {formatPrice(subtotal)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-stone-600 dark:text-stone-400">Shipping</span>
                                        <span className="font-medium text-stone-900 dark:text-white">
                                            {shipping === 0 ? (
                                                <span className="text-green-600">FREE</span>
                                            ) : (
                                                formatPrice(shipping)
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-between">
                                    <span className="text-lg font-semibold text-stone-900 dark:text-white">
                                        Total
                                    </span>
                                    <span className="text-xl font-bold text-amber-600">
                                        {formatPrice(total)}
                                    </span>
                                </div>

                                {subtotal < 2000 && (
                                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm dark:bg-amber-900/20">
                                        <Truck className="h-4 w-4 text-amber-600" />
                                        <span className="text-amber-700 dark:text-amber-400">
                                            Add {formatPrice(2000 - subtotal)} more for free shipping!
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
