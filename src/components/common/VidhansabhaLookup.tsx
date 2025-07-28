import React, { useState, useEffect } from 'react';
import { Search, MapPin, Users } from 'lucide-react';
import { Card, Input } from '../ui';

interface Vidhansabha {
  vidhansabhaNo: number;
  assemblyName: string;
  districtName: string;
  category?: string;
}

interface VidhansabhaLookupProps {
  onSelect?: (vidhansabha: Vidhansabha) => void;
  initialValue?: string;
  placeholder?: string;
}

const VidhansabhaLookup: React.FC<VidhansabhaLookupProps> = ({
  onSelect,
  initialValue = '',
  placeholder = 'Enter Vidhansabha number or assembly name'
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [results, setResults] = useState<Vidhansabha[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedVidhansabha, setSelectedVidhansabha] = useState<Vidhansabha | null>(null);

  useEffect(() => {
    if (searchTerm.length >= 1) {
      searchVidhansabha();
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [searchTerm]);

  const searchVidhansabha = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`https://api.expengo.com/api/vidhansabha/search?term=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('voter_admin_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.data || []);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error searching vidhansabha:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (vidhansabha: Vidhansabha) => {
    setSelectedVidhansabha(vidhansabha);
    setSearchTerm(vidhansabha.vidhansabhaNo.toString());
    setShowResults(false);
    if (onSelect) {
      onSelect(vidhansabha);
    }
  };

  const getCategoryBadge = (category?: string) => {
    if (!category) return null;
    
    const colors = {
      'ST': 'bg-green-100 text-green-800',
      'SC': 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[category as keyof typeof colors]}`}>
        {category}
      </span>
    );
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          type="text"
          value={searchTerm}
          onChange={(value) => setSearchTerm(value)}
          placeholder={placeholder}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Selected Vidhansabha Info */}
      {selectedVidhansabha && !showResults && (
        <Card className="mt-2 p-3 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-blue-900">
                  {selectedVidhansabha.vidhansabhaNo} - {selectedVidhansabha.assemblyName}
                </span>
              </div>
              {getCategoryBadge(selectedVidhansabha.category)}
            </div>
            <div className="flex items-center space-x-1 text-sm text-blue-700">
              <MapPin className="w-3 h-3" />
              <span>{selectedVidhansabha.districtName}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Search Results */}
      {showResults && results.length > 0 && (
        <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-white border shadow-lg">
          {results.map((vidhansabha) => (
            <div
              key={vidhansabha.vidhansabhaNo}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
              onClick={() => handleSelect(vidhansabha)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-600" />
                    <span className="font-medium">
                      {vidhansabha.vidhansabhaNo} - {vidhansabha.assemblyName}
                    </span>
                  </div>
                  {getCategoryBadge(vidhansabha.category)}
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <MapPin className="w-3 h-3" />
                  <span>{vidhansabha.districtName}</span>
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* No Results */}
      {showResults && results.length === 0 && !isLoading && searchTerm.length >= 1 && (
        <Card className="absolute z-10 w-full mt-1 p-3 bg-white border shadow-lg">
          <div className="text-center text-gray-500">
            <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No constituencies found for "{searchTerm}"</p>
            <p className="text-sm">Try searching by number or assembly name</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default VidhansabhaLookup;
