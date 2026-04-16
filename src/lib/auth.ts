import type { UserRole } from '@/types'

export function normalizeRole(role: unknown): UserRole {
    return String(role ?? '').trim().toLowerCase() === 'admin' ? 'admin' : 'customer'
}

export function isAdminRole(role: unknown): boolean {
    return normalizeRole(role) === 'admin'
}
