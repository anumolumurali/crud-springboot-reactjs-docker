import React from 'react';

function SearchBar({ searchTerm, onSearchInputChange, onExecuteSearch, onClearSearch }) {
  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search by Employee ID..."
        value={searchTerm}
        onChange={onSearchInputChange}
        onKeyDown={(e) => e.key === 'Enter' && onExecuteSearch()}
      />
      <button onClick={onExecuteSearch} className="search-button">Search</button>
      <button onClick={onClearSearch} className="clear-button">Clear</button>
    </div>
  );
}

export default SearchBar;