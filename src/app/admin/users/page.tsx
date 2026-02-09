'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
    Users,
    Search,
    LayoutDashboard,
    Package,
    ShoppingBag,
    Shield,
    Mail
} from 'lucide-react'
import { Button, Badge, Card, CardContent } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Profile } from '@/types'

export default function AdminUsersPage() {
    const supabase = createClient()
    const [users, setUsers] = useState<Profile[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchUsers()
    }, [])

    async function fetchUsers() {
        setIsLoading(true)
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })

        setUsers((data || []) as Profile[])
        setIsLoading(false)
    }

    async function toggleRole(user: Profile) {
        const newRole = user.role === 'admin' ? 'customer' : 'admin'

        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', user.id)

        if (error) {
            toast.error('Failed to update user role')
        } else {
            setUsers(prev =>
                prev.map(u => (u.id === user.id ? { ...u, role: newRole } : u))
            )
            toast.success(`User role updated to ${newRole}`)
        }
    }

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
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
                                Users Management
                            </h1>
                            <p className="text-sm text-stone-500">{users.length} users total</p>
                        </div>
                    </div>

                    {/* Admin Nav */}
                    <nav className="mt-6 flex gap-1">
                        {[
                            { href: '/admin', label: 'Overview', icon: LayoutDashboard },
                            { href: '/admin/products', label: 'Products', icon: Package },
                            { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
                            { href: '/admin/users', label: 'Users', icon: Users, active: true },
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
                <div className="mb-6">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search users..."
                            className="h-10 w-full rounded-lg border border-stone-200 bg-white pl-10 pr-4 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-900"
                        />
                    </div>
                </div>

                {/* Users Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-stone-100 bg-stone-50 text-left text-sm text-stone-500 dark:border-stone-800 dark:bg-stone-900">
                                        <th className="px-6 py-4 font-medium">User</th>
                                        <th className="px-6 py-4 font-medium">Email</th>
                                        <th className="px-6 py-4 font-medium">Phone</th>
                                        <th className="px-6 py-4 font-medium">Joined</th>
                                        <th className="px-6 py-4 font-medium">Role</th>
                                        <th className="px-6 py-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {filteredUsers.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-b border-stone-50 dark:border-stone-800/50"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-amber-500 text-sm font-medium text-white">
                                                        {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                                    </div>
                                                    <p className="font-medium text-stone-900 dark:text-white">
                                                        {user.full_name || 'No name'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-stone-600 dark:text-stone-400">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 text-stone-600 dark:text-stone-400">
                                                {user.phone || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-stone-600 dark:text-stone-400">
                                                {formatDate(user.created_at)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                                    {user.role === 'admin' && <Shield className="mr-1 h-3 w-3" />}
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => toggleRole(user)}
                                                >
                                                    {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                                                </Button>
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
