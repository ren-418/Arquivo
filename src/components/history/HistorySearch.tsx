// components/history/HistorySearch.tsx
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HistorySearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const HistorySearch: React.FC<HistorySearchProps> = ({
  searchTerm,
  setSearchTerm,
}) => {
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="relative flex w-full max-w-sm items-center">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search events..."
        className="pl-8 pr-10"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 h-full px-3 py-2"
          onClick={handleClearSearch}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  );
};