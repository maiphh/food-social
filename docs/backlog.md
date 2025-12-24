# FoodStagram Project Backlog

> Last Updated: 2024-12-24

This document tracks all features from the blueprint with their implementation status and priority levels.

---

## Priority Legend

| Priority | Description |
|----------|-------------|
| 🔴 **HIGH** | Core MVP features, blocking other work |
| 🟡 **MID** | Important features for Phase 2 |
| 🟢 **LOW** | Nice-to-have, Phase 3+ features |

---

## Phase 1: The "Memory Keeper" (Foundation)

### Authentication
| Status | Priority | Feature | Notes |
|--------|----------|---------|-------|
| ✅ | 🔴 HIGH | Login with Google | `signInWithGoogle()` in auth.ts |
| ✅ | 🟡 MID | Login with Facebook | `signInWithFacebook()` in auth.ts |
| ✅ | 🟢 LOW | Guest login | `signInAsGuest()` in auth.ts |
| ✅ | 🔴 HIGH | Logout | `logout()` in auth.ts |
| ✅ | 🔴 HIGH | User profile creation | `createUserProfile()` in user.ts |

### Post Creation
| Status | Priority | Feature | Notes |
|--------|----------|---------|-------|
| ✅ | 🔴 HIGH | Create post with text review | `createPost()` in post.ts |
| ✅ | 🔴 HIGH | Upload photo(s) | Images array in Post type, Cloudinary integration |
| ✅ | 🔴 HIGH | Numeric ratings (food, ambiance, overall) | `ratings` field in Post type |
| ✅ | 🔴 HIGH | Public/Private visibility toggle | `visibility` field in Post type |
| ✅ | 🟡 MID | Address field | `address` field in Post type |
| ✅ | 🟡 MID | Price range (min/max) | `priceMin`, `priceMax` fields |
| ✅ | 🟡 MID | Recommendation level | `recommendation` field (not-recommend/recommend/highly-recommend) |
| ✅ | 🔴 HIGH | Edit post | `updatePost()` in post.ts |
| ✅ | 🔴 HIGH | Delete post | `deletePost()` in post.ts |

### Feeds
| Status | Priority | Feature | Notes |
|--------|----------|---------|-------|
| ✅ | 🔴 HIGH | Global public feed | `getPublicFeed()` in post.ts, sorted by createdAt |
| ✅ | 🔴 HIGH | User's own posts (Profile Feed) | `getUserPosts()` in post.ts |
| ⬜ | 🟡 MID | Pagination for feeds | Currently limited to 20 posts |

### Components
| Status | Priority | Feature | Notes |
|--------|----------|---------|-------|
| ✅ | 🔴 HIGH | PostCard component | Displays post with author, images, ratings |
| ✅ | 🔴 HIGH | CreatePostModal | Full post creation form |
| ✅ | 🔴 HIGH | BottomNav | Mobile navigation |
| ✅ | 🔴 HIGH | PostDetail | Expanded post view |

---

## Phase 2: The "Inner Circle" (Groups)

### Group Management
| Status | Priority | Feature | Notes |
|--------|----------|---------|-------|
| ✅ | 🔴 HIGH | Create group | `createGroup()` in group.ts |
| ✅ | 🔴 HIGH | Join group | `joinGroup()` in group.ts |
| ✅ | 🔴 HIGH | Leave group | `leaveGroup()` in group.ts |
| ✅ | 🔴 HIGH | Delete group | `deleteGroup()` in group.ts |
| ✅ | 🔴 HIGH | Get user's groups | `getUserGroups()` in group.ts |
| ✅ | 🔴 HIGH | Get group details | `getGroup()` in group.ts |
| ✅ | 🟡 MID | Group roles (Owner/Admin/Member) | `GroupRole` enum, `roles` map in Group |
| ✅ | 🟡 MID | Make user admin | `makeAdmin()` in group.ts |
| ✅ | 🟡 MID | Add member (by admin/owner) | `addMember()` in group.ts |
| ✅ | 🟡 MID | Remove member (kick) | `removeMember()` in group.ts |
| ✅ | 🟡 MID | Get members with roles | `getMembers()`, `getMembersByRole()` |
| ✅ | 🔴 HIGH | Invite link flow | `/join/[inviteCode]` route exists but needs full implementation |
| ✅ | 🟡 MID | GroupCard component | Displays group info |
| ✅ | 🟡 MID | GroupManagementModal | Admin controls for groups |

### Group Posting
| Status | Priority | Feature | Notes |
|--------|----------|---------|-------|
| ✅ | 🔴 HIGH | Post to group (visibility='group') | `groupId` field in Post, selectable in CreatePostModal |
| ✅ | 🔴 HIGH | Group feed | `getGroupPosts()` in post.ts |
| ✅ | 🔴 HIGH | Group detail page | `/groups/[groupId]` route |

---

## Phase 3: The "Social Network" (Expansion)

### Follow System
| Status | Priority | Feature | Notes |
|--------|----------|---------|-------|
| ⬜ | 🟢 LOW | Follow user | `following` array exists in User type but no service function |
| ⬜ | 🟢 LOW | Unfollow user | Not implemented |
| ⬜ | 🟢 LOW | Get followers/following list | Not implemented |
| ⬜ | 🟢 LOW | Following feed | Not implemented |

### Map View
| Status | Priority | Feature | Notes |
|--------|----------|---------|-------|
| ⬜ | 🟢 LOW | Google Maps integration | Not implemented |
| ⬜ | 🟢 LOW | Place data with placeId | `placeData` field in schema but not in current Post type |
| ⬜ | 🟢 LOW | Map view of posts | Not implemented |

---

## Bonus Features (Beyond MVP)

### Social Interactions
| Status | Priority | Feature | Notes |
|--------|----------|---------|-------|
| ✅ | 🟡 MID | Reactions (like, love, haha, sad) | Full implementation in reaction.ts |
| ✅ | 🟡 MID | Toggle reaction | `toggleReaction()` handles add/remove/change |
| ✅ | 🟡 MID | Reaction counts | `getReactionCounts()`, stored on post |
| ✅ | 🟡 MID | PostActions component | UI for reactions |

### Comments
| Status | Priority | Feature | Notes |
|--------|----------|---------|-------|
| ✅ | 🟡 MID | Create comment | `createComment()` in comments.ts |
| ✅ | 🟡 MID | Delete comment | `deleteComment()` in comments.ts |
| ✅ | 🟡 MID | Reply to comment | `replyComment()` with nested replies |
| ✅ | 🟡 MID | Delete reply | `deleteReply()` in comments.ts |
| ✅ | 🟡 MID | Get comments for post | `getComments()` in comments.ts |
| ✅ | 🟡 MID | CommentsSection component | Full UI for comments |

### Saved Posts
| Status | Priority | Feature | Notes |
|--------|----------|---------|-------|
| ✅ | 🟡 MID | Save post | `savePost()` in savedPost.ts |
| ✅ | 🟡 MID | Unsave post | `unsavePost()` in savedPost.ts |
| ✅ | 🟡 MID | Check if saved | `isPostSaved()` in savedPost.ts |
| ✅ | 🟡 MID | Get saved posts list | `getSavedPosts()` in savedPost.ts |
| ⬜ | 🟡 MID | Saved posts page/tab | UI not implemented |

### User Profile
| Status | Priority | Feature | Notes |
|--------|----------|---------|-------|
| ✅ | 🟡 MID | Get user profile | `getUser()` in user.ts |
| ✅ | 🟡 MID | Change username | `changeUserName()` in user.ts |
| ✅ | 🟡 MID | Change profile picture | `changePfp()` in user.ts |
| ✅ | 🟡 MID | User profile page | `/[userId]` route exists |

---

## Summary Statistics

| Category | Done | Pending | Total |
|----------|------|---------|-------|
| Phase 1 (Foundation) | 17 | 1 | 18 |
| Phase 2 (Groups) | 15 | 1 | 16 |
| Phase 3 (Social) | 0 | 6 | 6 |
| Bonus Features | 16 | 1 | 17 |
| **TOTAL** | **48** | **9** | **57** |

---

## Next Priority Tasks

1. 🔴 **HIGH**: Complete invite link flow for groups
2. 🟡 **MID**: Add pagination to feeds  
3. 🟡 **MID**: Create saved posts page/tab
4. 🟢 **LOW**: Implement follow/unfollow system
5. 🟢 **LOW**: Add Google Maps integration
