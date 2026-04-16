import Link from 'next/link'
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react'

const footerLinks = {
    shop: [
        { href: '/artifacts', label: 'All Artifacts' },
        { href: '/categories', label: 'Categories' },
        { href: '/artifacts?featured=true', label: 'Featured' },
        { href: '/artifacts?authenticity=verified', label: 'Verified Items' },
    ],
    company: [
        { href: '/about', label: 'About Us' },
        { href: '/contact', label: 'Contact' },
        { href: '/faq', label: 'FAQ' },
        { href: '/shipping', label: 'Shipping' },
    ],
    legal: [
        { href: '/terms', label: 'Terms of Service' },
        { href: '/privacy', label: 'Privacy Policy' },
        { href: '/refund', label: 'Refund Policy' },
    ],
}

export function Footer() {
    return (
        <footer className="border-t border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-950">
            <div className="mx-auto max-w-7xl px-4 py-16">
                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-amber-500">
                                <span className="text-xl font-bold text-white">H</span>
                            </div>
                            <span className="text-xl font-bold text-stone-900 dark:text-white">
                                Heritage<span className="text-amber-600">Kart</span>
                            </span>
                        </Link>
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                            Your trusted marketplace for authenticated historical and cultural artifacts.
                            Preserving heritage, one artifact at a time.
                        </p>
                        <div className="flex gap-3">
                            <a
                                href="#"
                                className="rounded-lg bg-stone-200 p-2 text-stone-600 transition-colors hover:bg-amber-100 hover:text-amber-600 dark:bg-stone-800 dark:text-stone-400"
                            >
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a
                                href="#"
                                className="rounded-lg bg-stone-200 p-2 text-stone-600 transition-colors hover:bg-amber-100 hover:text-amber-600 dark:bg-stone-800 dark:text-stone-400"
                            >
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a
                                href="#"
                                className="rounded-lg bg-stone-200 p-2 text-stone-600 transition-colors hover:bg-amber-100 hover:text-amber-600 dark:bg-stone-800 dark:text-stone-400"
                            >
                                <Twitter className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Shop Links */}
                    <div>
                        <h3 className="mb-4 font-semibold text-stone-900 dark:text-white">Shop</h3>
                        <ul className="space-y-2">
                            {footerLinks.shop.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-stone-600 transition-colors hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="mb-4 font-semibold text-stone-900 dark:text-white">Company</h3>
                        <ul className="space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-stone-600 transition-colors hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="mb-4 font-semibold text-stone-900 dark:text-white">Contact</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm text-stone-600 dark:text-stone-400">
                                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                                <span>123 Heritage Lane, Cultural District, Mumbai 400001, India</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-stone-600 dark:text-stone-400">
                                <Phone className="h-4 w-4 flex-shrink-0 text-amber-600" />
                                <span>+91 98765 43210</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-stone-600 dark:text-stone-400">
                                <Mail className="h-4 w-4 flex-shrink-0 text-amber-600" />
                                <span>hello@heritagekart.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-stone-200 pt-8 dark:border-stone-800 md:flex-row">
                    <p className="text-sm text-stone-500">
                        © {new Date().getFullYear()} HeritageKart. All rights reserved.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {footerLinks.legal.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm text-stone-500 transition-colors hover:text-amber-600"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}
