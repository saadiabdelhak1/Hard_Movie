import React from 'react'

const Filters = ({ 
    filters, 
    onFilterChange,
    onClearFilters,
    genres = [] 
}) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({length: 30}, (_, i) => currentYear - i);

    const sortOptions = [
        { value: 'popularity.desc', label: 'Most Popular' },
        { value: 'popularity.asc', label: 'Least Popular' },
        { value: 'release_date.desc', label: 'Newest First' },
        { value: 'release_date.asc', label: 'Oldest First' },
        { value: 'vote_average.desc', label: 'Highest Rated' },
        { value: 'vote_average.asc', label: 'Lowest Rated' },
        { value: 'original_title.asc', label: 'A to Z' },
        { value: 'original_title.desc', label: 'Z to A' }
    ];

    const handleFilterChange = (filterType, value) => {
        onFilterChange(filterType, value);
    };

    const handleClearFilters = () => {
        onClearFilters();
    };

    return (
        <div className="filters">
            <div className="filters-header">
                <h3>Filter Movies</h3>
                <button 
                    onClick={handleClearFilters}
                    className="clear-filters-btn"
                >
                    Clear All
                </button>
            </div>

            <div className="filters-grid">
                {/* Sort By */}
                <div className="filter-group">
                    <label htmlFor="sort_by">Sort by:</label>
                    <select 
                        id="sort_by"
                        value={filters.sort_by}
                        onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                        className="filter-select"
                    >
                        {sortOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Genre Filter */}
                {genres.length > 0 && (
                    <div className="filter-group">
                        <label htmlFor="with_genres">Genre:</label>
                        <select 
                            id="with_genres"
                            value={filters.with_genres}
                            onChange={(e) => handleFilterChange('with_genres', e.target.value)}
                            className="filter-select"
                        >
                            <option value="">All Genres</option>
                            {genres.map(genre => (
                                <option key={genre.id} value={genre.id}>
                                    {genre.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Year Filter */}
                <div className="filter-group">
                    <label htmlFor="primary_release_year">Year:</label>
                    <select 
                        id="primary_release_year"
                        value={filters.primary_release_year}
                        onChange={(e) => handleFilterChange('primary_release_year', e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Years</option>
                        {years.map(year => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Rating Filter */}
                <div className="filter-group">
                    <label htmlFor="vote_average">Min Rating:</label>
                    <select 
                        id="vote_average"
                        value={filters.vote_average}
                        onChange={(e) => handleFilterChange('vote_average', e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Any Rating</option>
                        <option value="8">8.0+ ⭐</option>
                        <option value="7">7.0+ ⭐</option>
                        <option value="6">6.0+ ⭐</option>
                        <option value="5">5.0+ ⭐</option>
                        <option value="4">4.0+ ⭐</option>
                    </select>
                </div>

                {/* Language Filter */}
                <div className="filter-group">
                    <label htmlFor="with_original_language">Language:</label>
                    <select 
                        id="with_original_language"
                        value={filters.with_original_language}
                        onChange={(e) => handleFilterChange('with_original_language', e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Languages</option>
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="it">Italian</option>
                        <option value="ja">Japanese</option>
                        <option value="ko">Korean</option>
                        <option value="zh">Chinese</option>
                        <option value="hi">Hindi</option>
                        <option value="ar">Arabic</option>
                    </select>
                </div>
            </div>
        </div>
    )
}

export default Filters