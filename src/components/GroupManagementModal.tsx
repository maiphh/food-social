'use client';

import { useState, useEffect } from 'react';
import { X, Trash2, UserPlus, Shield, ShieldAlert, User as UserIcon, LogOut, ShieldPlus, Link2, Check } from 'lucide-react';
import { User, GroupRole } from '@/types';
import { getMembers, addMember, removeMember, makeAdmin, leaveGroup } from '@/services/group';
import { auth } from '@/lib/firebase';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface GroupManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
    currentUserRole: GroupRole;
}

interface MemberItem {
    user: User;
    role: GroupRole;
}

export default function GroupManagementModal({ isOpen, onClose, groupId, currentUserRole }: GroupManagementModalProps) {
    const [members, setMembers] = useState<MemberItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newMemberId, setNewMemberId] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchMembers();
        }
    }, [isOpen, groupId]);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const data = await getMembers(groupId);
            setMembers(data);
        } catch (err) {
            console.error("Failed to fetch members", err);
            setError("Failed to load members");
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMemberId.trim()) return;

        setActionLoading(true);
        setError(null);
        try {
            await addMember(groupId, newMemberId.trim());
            setNewMemberId('');
            setIsAdding(false);
            await fetchMembers();
        } catch (err: any) {
            console.error("Failed to add member", err);
            setError(err.message || "Failed to add member");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!confirm("Are you sure you want to remove this member?")) return;

        setActionLoading(true);
        setError(null);
        try {
            await removeMember(groupId, userId);
            await fetchMembers();
        } catch (err: any) {
            console.error("Failed to remove member", err);
            setError(err.message || "Failed to remove member");
        } finally {
            setActionLoading(false);
        }
    };

    const handleMakeAdmin = async (userId: string) => {
        if (!confirm("Are you sure you want to promote this member to Admin?")) return;

        setActionLoading(true);
        setError(null);
        try {
            await makeAdmin(groupId, userId);
            await fetchMembers();
        } catch (err: any) {
            console.error("Failed to make admin", err);
            setError(err.message || "Failed to make admin");
        } finally {
            setActionLoading(false);
        }
    };

    const handleLeaveGroup = async () => {
        if (!confirm("Are you sure you want to leave this group?")) return;
        if (!auth.currentUser) return;

        setActionLoading(true);
        setError(null);
        try {
            await leaveGroup(groupId, auth.currentUser.uid);
            onClose();
            window.location.href = '/';
        } catch (err: any) {
            console.error("Failed to leave group", err);
            setError(err.message || "Failed to leave group");
            setActionLoading(false);
        }
    };

    const handleCopyInviteLink = async () => {
        const inviteLink = `${window.location.origin}/join/${groupId}`;
        try {
            await navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy invite link', err);
        }
    };

    const canManage = currentUserRole === GroupRole.OWNER || currentUserRole === GroupRole.ADMIN;
    const isOwner = currentUserRole === GroupRole.OWNER;

    const canRemove = (targetRole: GroupRole, targetUserId: string) => {
        if (targetUserId === auth.currentUser?.uid) return false;
        if (currentUserRole === GroupRole.OWNER) return true;
        if (currentUserRole === GroupRole.ADMIN) {
            return targetRole === GroupRole.MEMBER;
        }
        return false;
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Group Members</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4">
                    {error && (
                        <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                            {error}
                        </div>
                    )}

                    {/* Invite Link Section */}
                    <div className="mb-4 p-3 bg-accent rounded-lg border border-border">
                        <div className="flex items-center gap-2 mb-2">
                            <Link2 className="w-4 h-4 text-primary" />
                            <h3 className="font-medium text-sm">Group Invite Link</h3>
                        </div>
                        <div
                            onClick={handleCopyInviteLink}
                            className="flex items-center justify-between p-2 bg-background rounded border border-border cursor-pointer hover:bg-accent transition-colors"
                        >
                            <span className="text-sm text-muted-foreground truncate flex-1">
                                {typeof window !== 'undefined' ? `${window.location.origin}/join/${groupId}` : ''}
                            </span>
                            <Button
                                size="sm"
                                className="ml-2 transition-transform hover:scale-105 active:scale-95"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-3 h-3 mr-1" />
                                        Copied!
                                    </>
                                ) : (
                                    'Copy'
                                )}
                            </Button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Spinner size="md" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {members.map(({ user, role }, index) => (
                                <div
                                    key={user.uid}
                                    className={cn(
                                        "flex items-center justify-between animate-in fade-in slide-in-from-bottom-2"
                                    )}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                                            <AvatarFallback>
                                                <UserIcon className="w-5 h-5" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm text-foreground">{user.displayName || 'Unknown User'}</p>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                {role === GroupRole.OWNER && <ShieldAlert className="w-3 h-3 text-yellow-500" />}
                                                {role === GroupRole.ADMIN && <Shield className="w-3 h-3 text-primary" />}
                                                <span className="capitalize">{role}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {isOwner && role === GroupRole.MEMBER && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleMakeAdmin(user.uid)}
                                                disabled={actionLoading}
                                                className="h-8 w-8 hover:text-primary hover:bg-primary/10"
                                                title="Make Admin"
                                            >
                                                <ShieldPlus className="w-4 h-4" />
                                            </Button>
                                        )}

                                        {canManage && canRemove(role, user.uid) && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveMember(user.uid)}
                                                disabled={actionLoading}
                                                className="h-8 w-8 hover:text-destructive hover:bg-destructive/10"
                                                title="Remove member"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-border flex flex-col gap-2">
                    {canManage && (
                        isAdding ? (
                            <form onSubmit={handleAddMember} className="flex gap-2">
                                <Input
                                    type="text"
                                    value={newMemberId}
                                    onChange={(e) => setNewMemberId(e.target.value)}
                                    placeholder="Enter User ID"
                                    autoFocus
                                    className="flex-1"
                                />
                                <Button type="submit" disabled={actionLoading}>
                                    Add
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsAdding(false)}
                                >
                                    Cancel
                                </Button>
                            </form>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={() => setIsAdding(true)}
                                className="w-full gap-2"
                            >
                                <UserPlus className="w-4 h-4" />
                                Add Member
                            </Button>
                        )
                    )}

                    <Button
                        variant="ghost"
                        onClick={handleLeaveGroup}
                        disabled={actionLoading}
                        className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                        <LogOut className="w-4 h-4" />
                        Leave Group
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
