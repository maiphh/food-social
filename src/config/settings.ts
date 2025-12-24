export const APP_CONFIG = {
    name: "Social Restaurant Review",
    maxPostLength: 500,
    ratingCategories: [
        { id: 'food', label: 'Food' },
        { id: 'ambiance', label: 'Ambiance' },
        { id: 'overall', label: 'Overall' }
    ],
    reactions: [
        { id: 'like', emoji: '👍' },
        { id: 'love', emoji: '❤️' },
        { id: 'haha', emoji: '😄' },
        { id: 'sad', emoji: '😢' },
    ] as const,
    defaultVisibility: 'public',
    placeholders: {
        createPost: "What did you eat today?",
        search: "Search for restaurants...",
        emptyFeed: "No posts yet. Be the first to share!",
        emptyReviews: "You haven't posted any reviews yet.",
        emptySaved: "No saved places yet."
    },
    navLinks: [
        { href: '/', label: 'Feed' },
        { href: '/groups', label: 'Groups' },
        { href: '/profile', label: 'Profile' }
    ]
};
