import { useState, useEffect } from 'react';
import axios from 'axios';

function HashThreats() {
  const [hashData, setHashData] = useState([]);
  const [error, setError] = useState('');
  const [searchHash, setSearchHash] = useState('');
  const [matchedHash, setMatchedHash] = useState(null);
  const [visibleHashCount, setVisibleHashCount] = useState(50);
  const [allHashData, setAllHashData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHashThreats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const response = await axios.get('http://localhost:8000/threats/hashes', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Assuming response.data is an array of strings
        setAllHashData(response.data);
        setHashData(response.data.slice(0, visibleHashCount));
      } catch (err) {
        console.error('Failed to fetch hash data:', err.message);
        setError('Failed to load hash threat data.');
      } finally {
      setLoading(false);
    }
    };

    fetchHashThreats();
  }, []); // Run only once on mount, NOT on visibleHashCount

  // Update visible slice when visibleHashCount or allHashData changes
  useEffect(() => {
    setHashData(allHashData.slice(0, visibleHashCount));
  }, [visibleHashCount, allHashData]);

  const handleSearch = () => {
    // If hash items are strings:
    const found = allHashData.find((item) => item === searchHash.trim());
    setMatchedHash(found || null);

    // If your data is actually objects like {value: 'hashstring'}, use:
    // const found = allHashData.find(item => item.value === searchHash.trim());
  };

  const handleSeeMore = () => {
    setVisibleHashCount((prev) => prev + 50);
  };

  return (
    <div className="min-h-screen bg-[#0E0B16] flex flex-col">
      {/* Top Bar */}
      <div className="bg-[#161025] p-4 flex items-center justify-between shadow-md">
        <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
        <button
          onClick={() => {
          localStorage.removeItem('token');
          window.location.href = '/login';
          }}
        className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition">
        Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 justify-center items-center p-6">
        <div className="w-full max-w-4xl">
          <h1 className="text-4xl font-semibold text-white mb-6 text-center">Hash Threats</h1>

          {/* Error Message */}
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

          {/* Search Bar */}
          <div className="mb-8 flex items-center justify-center space-x-4">
            <input
              type="text"
              placeholder="Enter hash to search..."
              value={searchHash}
              onChange={(e) => setSearchHash(e.target.value)}
              className="w-full sm:w-1/3 p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Search
            </button>
          </div>

          {/* Search Result */}
          {searchHash && (
            <div className="text-center mb-6">
              {matchedHash ? (
                <p className="text-green-500">✅ Hash found: {matchedHash}</p>
              ) : (
                <p className="text-red-500">❌ Hash not found in threat list</p>
              )}
            </div>
          )}

          {/* Hash Threat List */}
          <div className="bg-white rounded-lg shadow-lg p-6 mt-4">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin" />
              </div>
            ) : hashData.length === 0 ? (
              <p className="text-center text-gray-500">No hash threats found.</p>
            ) : (
              <ul className="space-y-2">
                {hashData.map((item, idx) => (
                  <li key={idx} className="text-lg text-gray-800 hover:text-blue-500 transition duration-200">
                    {item}
                    {/* if item is an object, use item.value */}
                  </li>
                ))}
              </ul>
            )}

            {/* See More Button */}
            {hashData.length < allHashData.length && (
              <div className="text-center mt-6">
                <button
                  onClick={handleSeeMore}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-200"
                >
                  See More
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HashThreats;
