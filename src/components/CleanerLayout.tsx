import { ReactNode, useState } from 'react'
import { Badge, Button } from '@/components/ui'
import { loadUserSession } from '@/lib/storage'

interface CleanerLayoutProps {
    children: ReactNode
    currentPage?: 'jobs' | 'active' | 'profile' | 'earnings' | 'settings'
}

export default function CleanerLayout({ children, currentPage = 'jobs' }: CleanerLayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const userSession = loadUserSession()

    const navItems = [
        { id: 'jobs', label: 'Jobs', icon: '💼', href: '/jobs' },
        { id: 'active', label: 'My Jobs', icon: '📋', href: '/cleaner-active' },
        { id: 'profile', label: 'Profile', icon: '👤', href: '/cleaner-profile' },
        { id: 'earnings', label: 'Earnings', icon: '💰', href: '/earnings' },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">

                        {}
                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => (
                                <a
                                    key={item.id}
                                    href={item.href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentPage === item.id
                                        ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span>{item.label}</span>
                                </a>
                            ))}
                        </nav>

                        {}
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-semibold text-gray-900">
                                    {userSession?.name || 'Cleaner'}
                                </p>
                                <p className="text-xs text-gray-500">Active</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                                {(userSession?.name || 'C')[0].toUpperCase()}
                            </div>

                            {}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {isMobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>

                    {}
                    {isMobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-gray-200 animate-up">
                            <nav className="flex flex-col gap-2">
                                {navItems.map((item) => (
                                    <a
                                        key={item.id}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${currentPage === item.id
                                            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        <span>{item.label}</span>
                                    </a>
                                ))}
                            </nav>
                        </div>
                    )}
                </div>
            </header>

            {}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            {}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
                <div className="grid grid-cols-4 gap-1 px-2 py-2">
                    {navItems.map((item) => (
                        <a
                            key={item.id}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${currentPage === item.id
                                ? 'bg-yellow-50 text-yellow-700'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span>{item.label}</span>
                        </a>
                    ))}
                </div>
            </nav>

            {}
            <div className="md:hidden h-20"></div>
        </div>
    )
}
