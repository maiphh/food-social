import Link from 'next/link';
import Image from 'next/image';
import { Group } from '@/types';

interface GroupCardProps {
    group: Group;
}

const DEFAULT_GROUP_IMAGE = '/images/default-group.png';

export default function GroupCard({ group }: GroupCardProps) {
    return (
        <Link href={`/groups/${group.id}`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center p-3 gap-3">
                    {/* Group Image */}
                    <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden">
                        <Image
                            src={group.imageUrl || DEFAULT_GROUP_IMAGE}
                            alt={group.name}
                            fill
                            className="object-cover"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = DEFAULT_GROUP_IMAGE;
                            }}
                        />
                    </div>

                    {/* Group Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base text-gray-900 truncate">
                            {group.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );
}
