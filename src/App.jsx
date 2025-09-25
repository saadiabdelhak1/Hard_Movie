import { useEffect, useState, useMemo, useCallback } from 'react'
import Search from './components/search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import { useDebounce } from 'react-use'
import { getTrendingMovies, updateSearchCount } from './Appwrite.js'

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMBD_API_KEY;

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
}

const App = () => {
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
    const [searchTerm, setSearchTerm] = useState('');

    const [movieList, setMovieList] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [trendingMovies, setTrendingMovies] = useState([]);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalResults, setTotalResults] = useState(0);
    
    const MOVIES_PER_PAGE = 20;

    // Debounce the search term to prevent making too many API requests
    // by waiting for the user to stop typing for 500ms
    useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

    const fetchMovies = useCallback(async (query = '', page = 1) => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const endpoint = query
                ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`
                : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${page}`;

            const response = await fetch(endpoint, API_OPTIONS);

            if(!response.ok) {
                throw new Error('Failed to fetch movies');
            }

            const data = await response.json();

            if(data.Response === 'False') {
                setErrorMessage(data.Error || 'Failed to fetch movies');
                setMovieList([]);
                setTotalPages(0);
                setTotalResults(0);
                return;
            }

            setMovieList(data.results || []);
            setTotalPages(Math.min(data.total_pages || 0, 500)); // TMDB API limit
            setTotalResults(data.total_results || 0);
            setCurrentPage(page);

            if(query && data.results && data.results.length > 0) {
                await updateSearchCount(query, data.results[0]);
            }
        } catch (error) {
            console.error(`Error fetching movies: ${error}`);
            setErrorMessage('Error fetching movies. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadTrendingMovies = useCallback(async () => {
        try {
            const movies = await getTrendingMovies();
            setTrendingMovies(movies || []);
        } catch (error) {
            console.error(`Error fetching trending movies: ${error}`);
            setTrendingMovies([]); // Set empty array on error
        }
    }, []);

    // Pagination handlers
    const handlePageChange = useCallback((newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchMovies(debouncedSearchTerm, newPage);
        }
    }, [fetchMovies, debouncedSearchTerm, totalPages]);

    const handleNextPage = useCallback(() => {
        handlePageChange(currentPage + 1);
    }, [handlePageChange, currentPage]);

    const handlePrevPage = useCallback(() => {
        handlePageChange(currentPage - 1);
    }, [handlePageChange, currentPage]);

    // Reset to page 1 when search term changes
    const resetToFirstPage = useCallback(() => {
        setCurrentPage(1);
        fetchMovies(debouncedSearchTerm, 1);
    }, [fetchMovies, debouncedSearchTerm]);

    // Memoized values for performance optimization
    const paginationInfo = useMemo(() => ({
        currentPage,
        totalPages,
        totalResults,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
        startResult: ((currentPage - 1) * MOVIES_PER_PAGE) + 1,
        endResult: Math.min(currentPage * MOVIES_PER_PAGE, totalResults)
    }), [currentPage, totalPages, totalResults]);

    const searchInfo = useMemo(() => ({
        isSearching: Boolean(debouncedSearchTerm.trim()),
        searchTerm: debouncedSearchTerm
    }), [debouncedSearchTerm]);

    useEffect(() => {
        resetToFirstPage();
    }, [resetToFirstPage]);

    useEffect(() => {
        loadTrendingMovies();
    }, [loadTrendingMovies]);

    return (
        <main>
            <div className="pattern"/>

            <div className="wrapper">
                <header>
                    <img src="./hero.png" alt="Hero Banner" />
                    <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>

                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </header>

                {trendingMovies && trendingMovies.length > 0 && (
                    <section className="trending">
                        <h2>Trending Movies</h2>

                        <ul>
                            {trendingMovies.map((movie, index) => (
                                <li key={movie.$id}>
                                    <p>{index + 1}</p>
                                    <img src={movie.poster_url} alt={movie.title} />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <section className="all-movies">
                    <h2>{searchInfo.isSearching ? `Search Results for "${searchInfo.searchTerm}"` : 'All Movies'}</h2>
                    
                    {totalResults > 0 && !isLoading && (
                        <div className="pagination-info">
                            <p className="text-gray-100 text-sm mb-4">
                                Showing {paginationInfo.startResult} - {paginationInfo.endResult} of {totalResults} movies
                            </p>
                        </div>
                    )}

                    {isLoading ? (
                        <Spinner />
                    ) : errorMessage ? (
                        <p className="text-red-500">{errorMessage}</p>
                    ) : (
                        <>
                            <ul>
                                {movieList.map((movie) => (
                                    <MovieCard key={movie.id} movie={movie} />
                                ))}
                            </ul>
                            
                            {totalPages > 1 && (
                                <div className="pagination">
                                    <button 
                                        onClick={handlePrevPage}
                                        disabled={!paginationInfo.hasPrevPage}
                                        className="pagination-btn"
                                    >
                                        Previous
                                    </button>
                                    
                                    <div className="pagination-numbers">
                                        {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                                            let page;
                                            if (totalPages <= 5) {
                                                page = index + 1;
                                            } else if (currentPage <= 3) {
                                                page = index + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                page = totalPages - 4 + index;
                                            } else {
                                                page = currentPage - 2 + index;
                                            }
                                            
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`pagination-number ${page === currentPage ? 'active' : ''}`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    
                                    <button 
                                        onClick={handleNextPage}
                                        disabled={!paginationInfo.hasNextPage}
                                        className="pagination-btn"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </main>
    )
}

export default App