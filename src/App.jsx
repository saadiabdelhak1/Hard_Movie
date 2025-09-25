import { useEffect, useState, useMemo, useCallback } from 'react'
import Search from './components/search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import Pagination from './components/Pagination.jsx'
import Filters from './components/Filters.jsx'
import Movie from './components/Movie.jsx'
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

    // Movie list state
    const [movieList, setMovieList] = useState([]);
    //handle query error
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Trending movies state
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [genres, setGenres] = useState([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalResults, setTotalResults] = useState(0);
    
    // Movie detail state
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [isLoadingMovieDetail, setIsLoadingMovieDetail] = useState(false);
    
    // Filter state
    const [filters, setFilters] = useState({
        sort_by: 'popularity.desc',
        with_genres: '',
        primary_release_year: '',
        vote_average: '',
        with_original_language: ''
    });
    
    const MOVIES_PER_PAGE = 20;

    
    useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

    // Build query parameters for API
    const buildQueryParams = useCallback((query, page, currentFilters) => {
        const params = new URLSearchParams({
            page: page.toString()
        });

        if (query) {
            // For search, we use search endpoint with limited filters
            params.append('query', query);
        } else {
            // For discovery, we can use all filters
            Object.entries(currentFilters).forEach(([key, value]) => {
                if (value) {
                    if (key === 'vote_average') {
                        params.append('vote_average.gte', value);
                    } else {
                        params.append(key, value);
                    }
                }
            });
        }

        return params;
    }, []);

    const fetchMovies = useCallback(async (query = '', page = 1, currentFilters = filters) => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const params = buildQueryParams(query, page, currentFilters);
            const baseEndpoint = query ? 'search/movie' : 'discover/movie';
            const endpoint = `${API_BASE_URL}/${baseEndpoint}?${params.toString()}`;

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
            setTotalPages(Math.min(data.total_pages || 0, 500)); 
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
    }, [buildQueryParams, filters]);

    // Fetch genres for filter dropdown
    const fetchGenres = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/genre/movie/list`, API_OPTIONS);
            if (response.ok) {
                const data = await response.json();
                setGenres(data.genres || []);
            }
        } catch (error) {
            console.error('Error fetching genres:', error);
        }
    }, []);

    const loadTrendingMovies = useCallback(async () => {
        try {
            const movies = await getTrendingMovies();
            setTrendingMovies(movies || []);
        } catch (error) {
            console.error(`Error fetching trending movies: ${error}`);
            setTrendingMovies([]); 
        }
    }, []);

    
    const handlePageChange = useCallback((newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchMovies(debouncedSearchTerm, newPage, filters);
        }
    }, [fetchMovies, debouncedSearchTerm, totalPages, filters]);

    const handleNextPage = useCallback(() => {
        handlePageChange(currentPage + 1);
    }, [handlePageChange, currentPage]);

    const handlePrevPage = useCallback(() => {
        handlePageChange(currentPage - 1);
    }, [handlePageChange, currentPage]);

    const resetToFirstPage = useCallback(() => {
        setCurrentPage(1);
        fetchMovies(debouncedSearchTerm, 1, filters);
    }, [fetchMovies, debouncedSearchTerm, filters]);

    // Filter handlers
    const handleFilterChange = useCallback((filterType, value) => {
        const newFilters = { ...filters, [filterType]: value };
        setFilters(newFilters);
        setCurrentPage(1);
        fetchMovies(debouncedSearchTerm, 1, newFilters);
    }, [filters, fetchMovies, debouncedSearchTerm]);

    const handleClearFilters = useCallback(() => {
        const clearedFilters = {
            sort_by: 'popularity.desc',
            with_genres: '',
            primary_release_year: '',
            vote_average: '',
            with_original_language: ''
        };
        setFilters(clearedFilters);
        setCurrentPage(1);
        fetchMovies(debouncedSearchTerm, 1, clearedFilters);
    }, [fetchMovies, debouncedSearchTerm]);

    // Movie detail handlers
    const fetchMovieDetails = useCallback(async (movieId) => {
        setIsLoadingMovieDetail(true);
        try {
            const response = await fetch(`${API_BASE_URL}/movie/${movieId}`, API_OPTIONS);
            if (response.ok) {
                const movieDetail = await response.json();
                setSelectedMovie(movieDetail);
                // Scroll to top when movie is selected
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (error) {
            console.error('Error fetching movie details:', error);
        } finally {
            setIsLoadingMovieDetail(false);
        }
    }, []);

    const handleMovieClick = useCallback((movie) => {
        fetchMovieDetails(movie.id);
    }, [fetchMovieDetails]);

    const handleGoBack = useCallback(() => {
        setSelectedMovie(null);
    }, []);

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
        fetchGenres();
    }, [loadTrendingMovies, fetchGenres]);

    return (
        <main>
            <div className="pattern"/>

            <div className="wrapper">
                {/* Conditional rendering: Movie detail view or normal header */}
                {selectedMovie ? (
                    <header>
                        {isLoadingMovieDetail ? (
                            <Spinner />
                        ) : (
                            <Movie 
                                movie={selectedMovie} 
                                onGoBack={handleGoBack} 
                            />
                        )}
                    </header>
                ) : (
                    <>
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

                            {/* Filters */}
                            <Filters 
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                onClearFilters={handleClearFilters}
                                genres={genres}
                            />

                            {isLoading ? (
                                <Spinner />
                            ) : errorMessage ? (
                                <p className="text-red-500">{errorMessage}</p>
                            ) : (
                                <>
                                    <ul>
                                        {movieList.map((movie) => (
                                            <MovieCard 
                                                key={movie.id} 
                                                movie={movie} 
                                                onMovieClick={handleMovieClick}
                                            />
                                        ))}
                                    </ul>
                                    
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        totalResults={totalResults}
                                        onPageChange={handlePageChange}
                                        onPrevPage={handlePrevPage}
                                        onNextPage={handleNextPage}
                                        paginationInfo={paginationInfo}
                                    />
                                </>
                            )}
                        </section>
                    </>
                )}
            </div>
        </main>
    )
}

export default App