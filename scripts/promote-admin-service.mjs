import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const targetEmail = (process.argv[2] || 'admin@heritagekart.com').trim().toLowerCase()
const targetName = (process.argv[3] || 'Admin User').trim()
const targetPassword = process.argv[4]

if (!SUPABASE_URL) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL in environment.')
    process.exit(1)
}

if (!SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY in environment.')
    process.exit(1)
}

if (!targetEmail) {
    console.error('Target email is required.')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
})

async function getUserByEmail(email) {
    let page = 1
    const perPage = 100

    while (true) {
        const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
        if (error) throw error

        const users = data?.users || []
        const found = users.find((user) => (user.email || '').toLowerCase() === email)
        if (found) return found
        if (users.length < perPage) return null
        page += 1
    }
}

async function ensureUser(email, fullName, password) {
    const existing = await getUserByEmail(email)
    if (existing) return existing

    if (!password) {
        throw new Error(
            `User ${email} not found. Provide a password as 3rd arg to create it: node scripts/promote-admin-service.mjs <email> "<name>" "<password>"`
        )
    }

    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
    })

    if (error) throw error
    return data.user
}

async function promoteToAdmin() {
    console.log(`Promoting ${targetEmail} to admin...`)

    const user = await ensureUser(targetEmail, targetName, targetPassword)
    if (!user?.id) throw new Error('Unable to resolve target user id')

    const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(
            {
                id: user.id,
                email: user.email || targetEmail,
                full_name: user.user_metadata?.full_name || targetName,
                role: 'admin',
            },
            { onConflict: 'id' }
        )

    if (upsertError) throw upsertError

    console.log('Success: user is now admin.')
    console.log(`Email: ${targetEmail}`)
    console.log(`User ID: ${user.id}`)
}

promoteToAdmin().catch((error) => {
    console.error('Failed to promote user:', error.message || error)
    if (String(error?.message || '').includes('Only admins can change user roles')) {
        console.error('\nYour DB trigger blocks service_role role updates.')
        console.error('Run the latest trigger function from supabase/schema.sql, then rerun this command.')
    }
    process.exit(1)
})
