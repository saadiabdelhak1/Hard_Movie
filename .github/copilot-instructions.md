# Hard Movie - Copilot Instructions

## Project Overview
A React-based movie discovery app using Vite, Tailwind CSS, and The Movie Database (TMDB) API with Appwrite for analytics tracking. The app features search, pagination, and trending movies with custom analytics.

## Architecture & Data Flow

### Core Components
- **App.jsx**: Main controller managing search state, API calls, pagination, and trending movies
- **Appwrite.js**: Analytics service tracking search terms and managing trending movies data
- **search.jsx**: Controlled input component with debounced search
- **MovieCard.jsx**: Movie display component with poster, rating, language, and year

### API Integration Pattern
```javascript
// TMDB API structure - all requests use bearer token auth
const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}` // Not `Api-Key`
    }
}
```

### Appwrite Analytics Flow
1. **Search tracking**: Every successful search creates/updates a document with `searchTerm`, `count`, `movie_id`, and `poster_url`
2. **Trending calculation**: Query top 5 documents ordered by `count` DESC
3. **Document structure**: Uses Appwrite's `$id` field and requires `ID.unique()` for creation

## Development Patterns

### State Management
- Use `useCallback` for functions passed to child components or used in effects
- Debounce search with `react-use` library (500ms delay)
- Memoize computed values like pagination info with `useMemo`
- Reset pagination when search term changes

### Error Handling
- All API calls wrapped in try-catch with user-friendly error messages
- Graceful fallbacks: trending movies default to empty array, poster images fallback to `/no-movie.png`
- Loading states managed with `isLoading` boolean

### CSS Architecture
- **Custom Tailwind theme** defined in `@theme` with project-specific colors and breakpoints
- **Component-based styles** using `@layer components` for reusable patterns
- **Custom utilities**: `text-gradient`, `fancy-text`, `hide-scrollbar`
- **Typography**: DM Sans for body, Bebas Neue for fancy numbers

## Environment Configuration
Required environment variables:
- `VITE_APPWRITE_PROJECT_ID`: Appwrite project identifier
- `VITE_APPWRITE_DATABASE_ID`: Database ID for analytics
- `VITE_APPWRITE_COLLECTION_ID`: Collection for search tracking
- `VITE_TMBD_API_KEY`: TMDB API bearer token

## Development Workflow
```bash
npm run dev      # Start development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint check
```

## Key Implementation Details
- **Pagination**: TMDB API limited to 500 pages max, displays smart 5-page navigation
- **Image handling**: TMDB poster URLs use `w500` size, fallback to local asset
- **Search debouncing**: Prevents excessive API calls during user typing
- **Analytics**: First search result triggers Appwrite tracking automatically
- **Responsive**: Mobile-first grid with xs:2, md:3, lg:4 columns