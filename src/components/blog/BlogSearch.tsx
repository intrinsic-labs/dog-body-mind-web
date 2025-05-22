"use client";

import { useState, useEffect, useRef } from 'react';

interface BlogSearchProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

const BlogSearch = ({ onSearch, searchQuery }: BlogSearchProps) => {
  const [query, setQuery] = useState(searchQuery);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Update local state when prop changes
  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };
  
  const handleClear = () => {
    setQuery('');
    onSearch('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && inputRef.current) {
      // Focus the input after expansion animation completes
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };
  
  return (
    <div className="relative w-full md:w-auto">
      <form onSubmit={handleSubmit} className="flex items-center w-full">
        <div 
          className={`flex items-center hover:bg-olive/50 overflow-hidden transition-all duration-300 w-full ${
            isExpanded ? 'bg-olive/50' : ''
          }`}
        >
          <button
            type="button"
            onClick={toggleExpand}
            className="flex-shrink-0 flex items-center justify-center w-10 h-8 text-neutral-800 hover:text-orange transition-colors duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles..."
            className={`bg-transparent text-accent outline-none text-sm w-full transition-all duration-300 ${
              isExpanded ? 'opacity-100 max-w-full pr-8' : 'opacity-0 max-w-0 p-0'
            }`}
          />
          
          {isExpanded && query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 text-neutral-800 hover:text-orange transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default BlogSearch; 