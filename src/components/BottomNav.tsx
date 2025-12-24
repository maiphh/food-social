'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Users } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';

export default function BottomNav() {
    const pathname = usePathname();
    const user = auth.currentUser;

    const navItems = [
        { href: '/', icon: Home, label: 'Home' },
        { href: '/groups', icon: Users, label: 'Groups' },
        { href: '/profile', icon: User, label: 'Profile' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50">
            {/* Glassmorphism background */}
            <div className="absolute inset-0 bg-background/70 backdrop-blur-xl border-t border-border/50" />

            <div className="relative max-w-2xl mx-auto px-2 safe-area-inset-bottom">
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href === '/profile' && pathname.startsWith(`/${user?.uid}`)) ||
                            (item.href === '/groups' && pathname.startsWith('/groups'));
                        const href = item.href === '/profile' ? (user ? `/${user.uid}` : '/login') : item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={href}
                                className={cn(
                                    "relative flex flex-col items-center justify-center gap-0.5 py-2 px-4 rounded-2xl transition-all duration-300",
                                    isActive
                                        ? "text-foreground"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {/* Active indicator pill */}
                                {isActive && (
                                    <span className="absolute -top-0.5 w-8 h-1 bg-foreground rounded-full" />
                                )}
                                <Icon className={cn(
                                    "w-5 h-5 transition-all duration-300",
                                    isActive && "scale-110"
                                )} />
                                <span className={cn(
                                    "text-[10px] font-medium transition-opacity",
                                    isActive ? "opacity-100" : "opacity-70"
                                )}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}

                    {/* Theme Toggle */}
                    <div className="flex flex-col items-center justify-center gap-0.5 py-2 px-4">
                        <ThemeToggle />
                        <span className="text-[10px] font-medium text-muted-foreground opacity-70">Theme</span>
                    </div>
                </div>
            </div>
        </nav>
    );
}
