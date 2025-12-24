import Link from 'next/link';
import Image from 'next/image';
import { Group } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';

interface GroupCardProps {
    group: Group;
}

const DEFAULT_GROUP_IMAGE = '/images/default-group.png';

export default function GroupCard({ group }: GroupCardProps) {
    return (
        <Link href={`/groups/${group.id}`}>
            <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99]">
                <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                        {/* Group Image */}
                        <Avatar className="h-14 w-14 rounded-lg">
                            <AvatarImage
                                src={group.imageUrl || DEFAULT_GROUP_IMAGE}
                                alt={group.name}
                                className="object-cover"
                            />
                            <AvatarFallback className="rounded-lg">
                                <Users className="w-6 h-6" />
                            </AvatarFallback>
                        </Avatar>

                        {/* Group Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base text-foreground truncate">
                                {group.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
