import type { UserRole } from '@/types'

export function normalizeRole(role: unknown): UserRole {
    return String(role ?? '').trim().toLowerCase() === 'admin' ? 'admin' : 'customer'
}

function parseAdminEmails(value: string | undefined): Set<string> {
    if (!value) return new Set()
    return new Set(
        value
            .split(',')
            .map((email) => email.trim().toLowerCase())
            .filter(Boolean)
    )
}

export function isWhitelistedAdminEmail(email: string | null | undefined): boolean {
    const normalizedEmail = (email || '').trim().toLowerCase()
    if (!normalizedEmail) return false

    const serverAdmins = parseAdminEmails(process.env.ADMIN_EMAILS)
    const publicAdmins = parseAdminEmails(process.env.NEXT_PUBLIC_ADMIN_EMAILS)
    return serverAdmins.has(normalizedEmail) || publicAdmins.has(normalizedEmail)
}

export function isAdminRole(role: unknown): boolean {
    return normalizeRole(role) === 'admin'
}

export function resolveUserRole(role: unknown, email: string | null | undefined): UserRole {
    if (isAdminRole(role) || isWhitelistedAdminEmail(email)) return 'admin'
    return 'customer'
}
