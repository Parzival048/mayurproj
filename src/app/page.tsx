import Link from 'next/link'
import { ArrowRight, Shield, Truck, Award, Sparkles } from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { ArtifactGrid } from '@/components/artifacts'
import { createClient } from '@/lib/supabase/server'
import type { Artifact, Category } from '@/types'

async function getFeaturedArtifacts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('artifacts')
    .select('*, category:categories(*)')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(8)

  return (data || []) as Artifact[]
}

async function getCategories() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (data || []) as Category[]
}

async function getLatestArtifacts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('artifacts')
    .select('*, category:categories(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(8)

  return (data || []) as Artifact[]
}

export default async function HomePage() {
  const [featuredArtifacts, categories, latestArtifacts] = await Promise.all([
    getFeaturedArtifacts(),
    getCategories(),
    getLatestArtifacts(),
  ])

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-stone-50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
        {/* Background Pattern */}
        <div className="hero-pattern absolute inset-0" />

        {/* Decorative Elements */}
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl dark:bg-amber-900/20" />
        <div className="absolute -right-20 bottom-20 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl dark:bg-amber-800/20" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Content */}
            <div className="text-center lg:text-left">
              <Badge className="mb-4 inline-flex items-center gap-1 rounded-full bg-amber-100 px-4 py-1.5 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                <Sparkles className="h-3.5 w-3.5" />
                Authentic Artifacts Marketplace
              </Badge>

              <h1 className="text-4xl font-bold leading-tight text-stone-900 dark:text-white sm:text-5xl lg:text-6xl">
                Discover the{' '}
                <span className="gradient-text">Rich Heritage</span>{' '}
                of Ancient India
              </h1>

              <p className="mt-6 text-lg text-stone-600 dark:text-stone-400">
                Explore our curated collection of authenticated historical and cultural
                artifacts. From ancient sculptures to rare manuscripts, each piece tells
                a unique story of our heritage.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link href="/artifacts">
                  <Button size="lg" className="w-full sm:w-auto">
                    Explore Collection
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Learn More
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-12 flex justify-center gap-8 lg:justify-start">
                <div>
                  <p className="text-3xl font-bold text-amber-600">500+</p>
                  <p className="text-sm text-stone-500">Verified Artifacts</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-amber-600">2,000+</p>
                  <p className="text-sm text-stone-500">Happy Collectors</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-amber-600">8</p>
                  <p className="text-sm text-stone-500">Categories</p>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative hidden lg:block">
              <div className="relative mx-auto aspect-square w-full max-w-lg">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 opacity-20 blur-2xl" />
                <img
                  src="https://images.unsplash.com/photo-1582126892906-5ba118eaf46e?w=800"
                  alt="Heritage Artifact"
                  className="relative rounded-3xl object-cover shadow-2xl"
                />
                {/* Floating Cards */}
                <div className="absolute -left-8 top-1/4 animate-float rounded-xl bg-white p-4 shadow-xl dark:bg-stone-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-900 dark:text-white">100% Verified</p>
                      <p className="text-xs text-stone-500">Authenticity Guaranteed</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-8 bottom-1/4 animate-float rounded-xl bg-white p-4 shadow-xl dark:bg-stone-800" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                      <Award className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-900 dark:text-white">Premium Quality</p>
                      <p className="text-xs text-stone-500">Expert Curated</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-stone-200 bg-white py-12 dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30">
                <Shield className="h-7 w-7 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 dark:text-white">Verified Authentic</h3>
                <p className="text-sm text-stone-500">Every artifact is verified by experts</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30">
                <Truck className="h-7 w-7 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 dark:text-white">Secure Shipping</h3>
                <p className="text-sm text-stone-500">Safe & insured delivery nationwide</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30">
                <Award className="h-7 w-7 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 dark:text-white">Certificate Included</h3>
                <p className="text-sm text-stone-500">Authenticity certificate with each item</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-stone-900 dark:text-white sm:text-4xl">
              Explore Categories
            </h2>
            <p className="mt-4 text-stone-600 dark:text-stone-400">
              Browse our diverse collection of historical artifacts
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                href={`/artifacts?category=${category.slug}`}
                className="group relative overflow-hidden rounded-2xl"
              >
                <div className="aspect-[4/3]">
                  <img
                    src={category.image_url || 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=400'}
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-stone-300">
                      {category.description || 'Explore unique pieces'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Artifacts */}
      {featuredArtifacts.length > 0 && (
        <section className="bg-stone-50 py-20 dark:bg-stone-900/50">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-12 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div>
                <h2 className="text-3xl font-bold text-stone-900 dark:text-white sm:text-4xl">
                  Featured Artifacts
                </h2>
                <p className="mt-2 text-stone-600 dark:text-stone-400">
                  Handpicked treasures from our collection
                </p>
              </div>
              <Link href="/artifacts?featured=true">
                <Button variant="outline">
                  View All Featured
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <ArtifactGrid artifacts={featuredArtifacts} />
          </div>
        </section>
      )}

      {/* Latest Arrivals */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <h2 className="text-3xl font-bold text-stone-900 dark:text-white sm:text-4xl">
                Latest Arrivals
              </h2>
              <p className="mt-2 text-stone-600 dark:text-stone-400">
                Newly added artifacts to our collection
              </p>
            </div>
            <Link href="/artifacts">
              <Button variant="outline">
                View All Artifacts
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <ArtifactGrid artifacts={latestArtifacts} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-600 to-amber-700 py-20">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Start Your Collection Today
          </h2>
          <p className="mt-4 text-lg text-amber-100">
            Join thousands of collectors who trust HeritageKart for authentic historical artifacts.
            Every piece comes with a certificate of authenticity.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button
                size="lg"
                className="w-full bg-white text-amber-700 hover:bg-amber-50 sm:w-auto"
              >
                Create Account
              </Button>
            </Link>
            <Link href="/artifacts">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-white text-white hover:bg-white/10 sm:w-auto"
              >
                Browse Collection
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
