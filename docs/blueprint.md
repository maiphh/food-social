Project Blueprint: "FoodStagram" (Working Title)

1. The Vision

Short Term: A personal memory keeper for food/places.

Long Term: "Instagram for Food" – a social discovery platform.

Core Loop: Eat -> Save (Private/Group) -> Share (Public).

2. Tech Stack (Finalized for MVP)

Frontend: Next.js + shadcn/ui (React).

Backend Logic: Next.js API Routes (Serverless). Python is removed for now to save complexity, as "Latest Post" sorting doesn't require AI.

Database: Firebase Firestore (Free tier).

Image Storage: Cloudinary (Recommended for free tier limits) or Firebase Storage (Watch the 1GB limit).

Auth: Firebase Auth (Google + Email).

3. Database Schema Design (Firestore)

This structure supports your "Collaborative Groups" and "Mixed Feed" requirements.

users (Collection)

uid: string

displayName: string

avatarUrl: string

following: array of user_ids (For the future social feed)

groups (Collection) - Addresses FR1 (Collaborative Lists)

id: string

name: string (e.g., "Summer Trip 2025")

ownerId: string

members: array of strings [uid1, uid2] (Who can post/view)

isPrivate: boolean (Usually true for friend groups)

posts (Collection) - The Core Data

id: string

authorId: string

content: string (Text review)

ratings: map { "food": 5, "ambiance": 4 } (Addresses A2)

images: array of strings (URLs)

placeData: map { "name": "Burger King", "address": "...", "placeId": "GoogleMapsID" }

visibility: string ('public', 'private', 'group')

groupId: string (Optional, if visibility is 'group')

createdAt: timestamp

4. Feature Roadmap

Phase 1: The "Memory Keeper" (Foundation)

Auth: Login with Google.

Post Creation:

Input: Place Name, 1 Photo, Text Review, Numeric Rating (1-5).

Toggle: Private (Only me) vs Public (Everyone).

Profile Feed: "My Places" (Query posts where authorId == myUid).

Global Feed (FR3): "New on FoodStagram" (Query posts where visibility == 'public', sort by createdAt).

Phase 2: The "Inner Circle" (Groups)

Group Management: Create Group -> Copy Invite Link -> User Joins.

Group Posting: When creating a post, select "Post to [Group Name]".

Group Feed: A dedicated page showing only posts with that groupId.

Phase 3: The "Social Network" (Expansion)

Follow System: Follow other users.

Enhanced Feed: "Following" tab (Query posts from people I follow).

Map View: See all public/group posts on a Google Map interface.