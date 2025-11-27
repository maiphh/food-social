import { useState, useEffect } from 'react';
import { X, Trash2, UserPlus, Shield, ShieldAlert, User as UserIcon, LogOut, ShieldPlus, Link2, Check } from 'lucide-react';
import { User, GroupRole } from '@/types';
import { getMembers, addMember, removeMember, makeAdmin, leaveGroup } from '@/services/group';
import { auth } from '@/lib/firebase';

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
            // Ideally redirect or refresh parent, but modal just closes for now. 
            // The parent page might need to handle the redirect if the user is no longer a member.
            window.location.href = '/'; // Simple redirect to home
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
        if (targetUserId === auth.currentUser?.uid) return false; // Cannot remove self via this button
        if (currentUserRole === GroupRole.OWNER) return true;
        if (currentUserRole === GroupRole.ADMIN) {
            return targetRole === GroupRole.MEMBER;
        }
        return false;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col shadow-xl">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Group Members</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md">
                            {error}
                        </div>
                    )}

                    {/* Invite Link Section */}
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Link2 className="w-4 h-4 text-blue-600" />
                            <h3 className="font-medium text-sm text-blue-900">Group Invite Link</h3>
                        </div>
                        <div
                            onClick={handleCopyInviteLink}
                            className="flex items-center justify-between p-2 bg-white rounded border border-blue-200 cursor-pointer hover:bg-blue-50 transition-colors group"
                        >
                            <span className="text-sm text-gray-700 truncate flex-1">
                                {window.location.origin}/join/{groupId}
                            </span>
                            <button
                                type="button"
                                className="ml-2 px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-3 h-3" />
                                        Copied!
                                    </>
                                ) : (
                                    'Copy'
                                )}
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading members...</div>
                    ) : (
                        <div className="space-y-4">
                            {members.map(({ user, role }) => (
                                <div key={user.uid} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt={user.displayName || 'User'} className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                <UserIcon className="w-6 h-6 text-gray-500" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-sm">{user.displayName || 'Unknown User'}</p>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                {role === GroupRole.OWNER && <ShieldAlert className="w-3 h-3 text-yellow-600" />}
                                                {role === GroupRole.ADMIN && <Shield className="w-3 h-3 text-blue-600" />}
                                                <span className="capitalize">{role}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {isOwner && role === GroupRole.MEMBER && (
                                            <button
                                                onClick={() => handleMakeAdmin(user.uid)}
                                                disabled={actionLoading}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                title="Make Admin"
                                            >
                                                <ShieldPlus className="w-4 h-4" />
                                            </button>
                                        )}

                                        {canManage && canRemove(role, user.uid) && (
                                            <button
                                                onClick={() => handleRemoveMember(user.uid)}
                                                disabled={actionLoading}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                title="Remove member"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t bg-gray-50 rounded-b-lg flex flex-col gap-2">
                    {canManage && (
                        isAdding ? (
                            <form onSubmit={handleAddMember} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMemberId}
                                    onChange={(e) => setNewMemberId(e.target.value)}
                                    placeholder="Enter User ID"
                                    className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                                >
                                    Add
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="px-3 py-2 text-gray-600 hover:bg-gray-200 rounded-md text-sm"
                                >
                                    Cancel
                                </button>
                            </form>
                        ) : (
                            <button
                                onClick={() => setIsAdding(true)}
                                className="w-full flex items-center justify-center gap-2 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                <UserPlus className="w-4 h-4" />
                                Add Member
                            </button>
                        )
                    )}

                    <button
                        onClick={handleLeaveGroup}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-2 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Leave Group
                    </button>
                </div>
            </div>
        </div>
    );
}
