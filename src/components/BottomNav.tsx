'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User } from 'lucide-react';
import { APP_CONFIG } from '@/config/settings';
import { auth } from '@/lib/firebase';

export default function BottomNav() {
    const pathname = usePathname();
    const user = auth.currentUser;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
            <div className="flex justify-around items-center h-16">
                {APP_CONFIG.navLinks.map((link) => {
                    const isActive = pathname === link.href || (link.href === '/profile' && pathname.startsWith(`/${user?.uid}`));
                    const Icon = link.href === '/feed' ? Home : User;
                    const href = link.href === '/profile' ? (user ? `/${user.uid}` : '/login') : link.href;

                    return (
                        <Link
                            key={link.href}
                            href={href}
                            className={`flex flex-col items-center gap-1 p-2 ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
                            <span className="text-xs font-medium">{link.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
