'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button, Input, Card, CardContent } from '@/components/ui'
import { resolveUserRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const redirectTo = searchParams.get('redirect') || '/'

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            })

            if (error) {
                toast.error(error.message)
                return
            }

            let nextPath = redirectTo
            if (!searchParams.get('redirect')) {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    await supabase
                        .from('profiles')
                        .upsert(
                            {
                                id: user.id,
                                email: user.email || '',
                                full_name: user.user_metadata?.full_name ?? null,
                            },
                            {
                                onConflict: 'id',
                                ignoreDuplicates: true,
                            }
                        )

                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', user.id)
                        .single()

                    if (resolveUserRole(profile?.role, user.email) === 'admin') {
                        nextPath = '/admin'
                    }
                }
            }

            toast.success('Welcome back!')
            router.push(nextPath)
            router.refresh()
        } catch {
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
                        Welcome back
                    </h1>
                    <p className="mt-2 text-stone-600 dark:text-stone-400">
                        Sign in to continue to HeritageKart
                    </p>
                </div>

                <Card className="shadow-xl">
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="you@example.com"
                                icon={<Mail className="h-4 w-4" />}
                                error={errors.email?.message}
                                {...register('email')}
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

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                                    />
                                    <span className="text-sm text-stone-600 dark:text-stone-400">Remember me</span>
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm font-medium text-amber-600 hover:text-amber-700"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                                Sign In
                            </Button>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-stone-200 dark:border-stone-700" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-white px-4 text-stone-500 dark:bg-stone-900">
                                        Don&apos;t have an account?
                                    </span>
                                </div>
                            </div>

                            <Link href="/register">
                                <Button variant="outline" className="mt-4 w-full">
                                    Create Account
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

import { Suspense } from 'react'

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    )
}
