import React from 'react'

const Movie = ({ movie, onGoBack }) => {
    if (!movie) return null;

    const {
        title,
        poster_path,
        backdrop_path,
        overview,
        release_date,
        runtime,
        vote_average,
        vote_count,
        genres,
        production_companies,
        production_countries,
        spoken_languages,
        budget,
        revenue,
        status,
        original_language,
        popularity
    } = movie;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatRuntime = (minutes) => {
        if (!minutes) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    return (
        <div className="movie-detail">
            {/* Return Button */}
            <button 
                onClick={onGoBack}
                className="return-btn"
                aria-label="Go back to movies list"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path 
                        d="M19 12H5M12 19L5 12L12 5" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    />
                </svg>
                Back to Movies
            </button>

            {/* Movie Header with Backdrop */}
            <div className="movie-header">
                {backdrop_path && (
                    <div 
                        className="movie-backdrop"
                        style={{
                            backgroundImage: `url(https://image.tmdb.org/t/p/original${backdrop_path})`
                        }}
                    />
                )}
                <div className="movie-header-overlay" />
                
                <div className="movie-header-content">
                    <div className="movie-poster-large">
                        <img
                            src={poster_path ? 
                                `https://image.tmdb.org/t/p/w500${poster_path}` : 
                                '/no-movie.png'
                            }
                            alt={title}
                        />
                    </div>
                    
                    <div className="movie-info">
                        <h1>{title}</h1>
                        
                        <div className="movie-meta">
                            <div className="rating">
                                <img src="/star.svg" alt="Rating" />
                                <span>{vote_average ? vote_average.toFixed(1) : 'N/A'}</span>
                                <span className="vote-count">({vote_count?.toLocaleString()} votes)</span>
                            </div>
                            
                            {release_date && (
                                <span className="release-year">
                                    {new Date(release_date).getFullYear()}
                                </span>
                            )}
                            
                            {runtime && (
                                <span className="runtime">
                                    {formatRuntime(runtime)}
                                </span>
                            )}
                            
                            <span className="language">
                                {original_language?.toUpperCase()}
                            </span>
                        </div>

                        {genres && genres.length > 0 && (
                            <div className="movie-genres">
                                {genres.map(genre => (
                                    <span key={genre.id} className="genre-tag">
                                        {genre.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        {overview && (
                            <div className="movie-overview">
                                <h3>Overview</h3>
                                <p>{overview}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Additional Movie Details */}
            <div className="movie-details-grid">
                <div className="movie-detail-section">
                    <h3>Movie Details</h3>
                    <div className="detail-grid">
                        <div className="detail-item">
                            <span className="detail-label">Status:</span>
                            <span className="detail-value">{status || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Release Date:</span>
                            <span className="detail-value">
                                {release_date ? new Date(release_date).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Runtime:</span>
                            <span className="detail-value">{formatRuntime(runtime)}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Popularity:</span>
                            <span className="detail-value">{popularity?.toFixed(1) || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {(budget > 0 || revenue > 0) && (
                    <div className="movie-detail-section">
                        <h3>Financial Information</h3>
                        <div className="detail-grid">
                            {budget > 0 && (
                                <div className="detail-item">
                                    <span className="detail-label">Budget:</span>
                                    <span className="detail-value">{formatCurrency(budget)}</span>
                                </div>
                            )}
                            {revenue > 0 && (
                                <div className="detail-item">
                                    <span className="detail-label">Revenue:</span>
                                    <span className="detail-value">{formatCurrency(revenue)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {production_companies && production_companies.length > 0 && (
                    <div className="movie-detail-section">
                        <h3>Production Companies</h3>
                        <div className="production-companies">
                            {production_companies.map(company => (
                                <span key={company.id} className="company-name">
                                    {company.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {spoken_languages && spoken_languages.length > 0 && (
                    <div className="movie-detail-section">
                        <h3>Languages</h3>
                        <div className="languages">
                            {spoken_languages.map((lang, index) => (
                                <span key={index} className="language-name">
                                    {lang.english_name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {production_countries && production_countries.length > 0 && (
                    <div className="movie-detail-section">
                        <h3>Production Countries</h3>
                        <div className="countries">
                            {production_countries.map((country, index) => (
                                <span key={index} className="country-name">
                                    {country.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Movie