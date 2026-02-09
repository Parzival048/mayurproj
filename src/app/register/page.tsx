'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react'
import { Button, Input, Card, CardContent } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

const registerSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    phone: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
    const router = useRouter()
    const supabase = createClient()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    })

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true)

        try {
            const { error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        full_name: data.fullName,
                        phone: data.phone,
                    },
                },
            })

            if (error) {
                toast.error(error.message)
                return
            }

            toast.success('Account created successfully! Please sign in.')
            router.push('/login')
        } catch (error) {
            toast.error('Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-amber-500">
                            <span className="text-2xl font-bold text-white">H</span>
                        </div>
                    </Link>
                    <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-white">
                        Create your account
                    </h1>
                    <p className="mt-2 text-stone-600 dark:text-stone-400">
                        Join HeritageKart and start collecting
                    </p>
                </div>

                <Card className="shadow-xl">
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <Input
                                label="Full Name"
                                type="text"
                                placeholder="John Doe"
                                icon={<User className="h-4 w-4" />}
                                error={errors.fullName?.message}
                                {...register('fullName')}
                            />

                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="you@example.com"
                                icon={<Mail className="h-4 w-4" />}
                                error={errors.email?.message}
                                {...register('email')}
                            />

                            <Input
                                label="Phone Number (Optional)"
                                type="tel"
                                placeholder="+91 98765 43210"
                                icon={<Phone className="h-4 w-4" />}
                                error={errors.phone?.message}
                                {...register('phone')}
                            />

                            <div className="relative">
                                <Input
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    icon={<Lock className="h-4 w-4" />}
                                    error={errors.password?.message}
                                    {...register('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-9 text-stone-400 hover:text-stone-600"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>

                            <Input
                                label="Confirm Password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                icon={<Lock className="h-4 w-4" />}
                                error={errors.confirmPassword?.message}
                                {...register('confirmPassword')}
                            />

                            <div className="flex items-start gap-2">
                                <input
                                    type="checkbox"
                                    required
                                    className="mt-1 h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                                />
                                <span className="text-sm text-stone-600 dark:text-stone-400">
                                    I agree to the{' '}
                                    <Link href="/terms" className="text-amber-600 hover:underline">
                                        Terms of Service
                                    </Link>{' '}
                                    and{' '}
                                    <Link href="/privacy" className="text-amber-600 hover:underline">
                                        Privacy Policy
                                    </Link>
                                </span>
                            </div>

                            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                                Create Account
                            </Button>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-stone-200 dark:border-stone-700" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-white px-4 text-stone-500 dark:bg-stone-900">
                                        Already have an account?
                                    </span>
                                </div>
                            </div>

                            <Link href="/login">
                                <Button variant="outline" className="mt-4 w-full">
                                    Sign In
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
