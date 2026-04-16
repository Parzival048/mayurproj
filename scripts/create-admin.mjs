import { createClient } from '@supabase/supabase-js'

// ===== CONFIGURE YOUR ADMIN CREDENTIALS HERE =====
const ADMIN_EMAIL = 'admin@heritagekart.com'
const ADMIN_PASSWORD = 'Admin@123456'
const ADMIN_NAME = 'Admin User'
// ==================================================

const SUPABASE_URL = 'https://pezkwglsmkhohdwkghtg.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlemt3Z2xzbWtob2hkd2tnaHRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMjAxOTIsImV4cCI6MjA5MTc5NjE5Mn0.ULm4T9JfGaiaAkBZe0nhTcH7h2tjrMo9u8S5lPcYl0Q'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function createAdmin() {
    console.log('🔐 Creating admin user...\n')

    // Step 1: Sign up the user
    console.log(`📧 Signing up: ${ADMIN_EMAIL}`)
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        options: {
            data: { full_name: ADMIN_NAME }
        }
    })

    if (signUpError) {
        // If user already exists, try signing in instead
        if (signUpError.message.includes('already registered') || signUpError.message.includes('already exists')) {
            console.log('⚠️  User already exists. Signing in to promote to admin...')

            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
            })

            if (signInError) {
                console.error('❌ Failed to sign in:', signInError.message)
                process.exit(1)
            }

            // Promote to admin
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ role: 'admin' })
                .eq('id', signInData.user.id)

            if (updateError) {
                console.error('❌ Failed to update role:', updateError.message)
                process.exit(1)
            }

            console.log('\n✅ User promoted to admin successfully!')
            console.log(`   Email:    ${ADMIN_EMAIL}`)
            console.log(`   Password: ${ADMIN_PASSWORD}`)
            process.exit(0)
        }

        console.error('❌ Sign up failed:', signUpError.message)
        process.exit(1)
    }

    const userId = signUpData.user?.id
    if (!userId) {
        console.error('❌ No user ID returned from signup')
        process.exit(1)
    }

    console.log(`✅ User created: ${userId}`)

    // Step 2: Wait a moment for the trigger to create the profile
    console.log('⏳ Waiting for profile to be created...')
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Step 3: Sign in to get an authenticated session
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
    })

    if (signInError) {
        console.error('❌ Failed to sign in:', signInError.message)
        process.exit(1)
    }

    // Step 4: Update the profile role to admin
    console.log('👑 Promoting user to admin...')
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId)

    if (updateError) {
        console.error('❌ Failed to update role:', updateError.message)
        console.log('\n💡 If RLS is blocking the update, run this SQL in your Supabase SQL Editor:')
        console.log(`   UPDATE public.profiles SET role = 'admin' WHERE email = '${ADMIN_EMAIL}';`)
        process.exit(1)
    }

    console.log('\n🎉 Admin user created successfully!')
    console.log('━'.repeat(40))
    console.log(`   Email:    ${ADMIN_EMAIL}`)
    console.log(`   Password: ${ADMIN_PASSWORD}`)
    console.log('━'.repeat(40))
    console.log('\n🌐 You can now log in at your app and access /admin')
}

createAdmin().catch(err => {
    console.error('❌ Unexpected error:', err)
    process.exit(1)
})
