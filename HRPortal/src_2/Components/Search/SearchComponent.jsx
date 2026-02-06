import React from 'react';
import { Search } from 'react-feather';

function SearchComponent(props) {
  return (
    <div>
      <div className="mb-4 flex items-center">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search documents..."
            value={props.searchTerm}
            onChange={(e) => props.setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
          <div className="absolute left-3 top-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchComponent;
