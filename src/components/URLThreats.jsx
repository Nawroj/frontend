import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'

function URLThreats({ user }) {
  const [urlData, setUrlData] = useState([]);
  const [error, setError] = useState('');
  const [searchUrl, setSearchUrl] = useState('');
  const [matchedUrl, setMatchedUrl] = useState(null);
  const [visibleUrlCount, setVisibleUrlCount] = useState(50);
  const [allUrlData, setAllUrlData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/threats/urls', {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        console.log('Fetched URLs:', response.data); // Debugging output

        // Assume array of strings
        setAllUrlData(response.data);
        setUrlData(response.data.slice(0, visibleUrlCount));
      } catch (err) {
        console.error('Error fetching URLs:', err.message);
        setError('Failed to load URL threats.');
      } finally {
      setLoading(false);
    }
    };

    fetchUrls();
  }, [user.token]);

  // Update the visible URLs when visible count or full data changes
  useEffect(() => {
    setUrlData(allUrlData.slice(0, visibleUrlCount));
  }, [visibleUrlCount, allUrlData]);

  const handleSearch = () => {
    const found = allUrlData.find((item) => item === searchUrl.trim());
    setMatchedUrl(found || null);
  };

  const handleSeeMore = () => {
    setVisibleUrlCount((prev) => prev + 50);
  };

  return (
    <div className="min-h-screen bg-[#0E0B16] flex flex-col">
      {/* Top Bar */}
      <header className="bg-[#161025] p-4 flex items-center justify-between shadow-md">
  <Link to="/">
    <img src="/logo.png" alt="Logo" className="h-10 w-auto cursor-pointer" />
  </Link>
  <button
    onClick={() => {
      localStorage.removeItem('token');
      window.location.href = '/';
    }}
    className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-300"
  >
    Logout
  </button>
</header>

      {/* Main Content */}
      <div className="flex flex-1 justify-center items-center p-6">
        <div className="w-full max-w-4xl">
          <h1 className="text-4xl font-semibold text-white mb-6 text-center">URL Threats</h1>

          {/* Error Message */}
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

          {/* Search Bar */}
          <div className="mb-8 flex items-center justify-center space-x-4">
            <input
              type="text"
              placeholder="Enter URL to search..."
              value={searchUrl}
              onChange={(e) => setSearchUrl(e.target.value)}
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
          {searchUrl && (
            <div className="text-center mb-6">
              {matchedUrl ? (
                <p className="text-green-500">✅ URL found: {matchedUrl}</p>
              ) : (
                <p className="text-red-500">❌ URL not found in threat list</p>
              )}
            </div>
          )}

          {/* URL Threat List */}
          <div className="bg-white rounded-lg shadow-lg p-6 mt-4">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin" />
              </div>
            ) : urlData.length === 0 ? (
              <p className="text-center text-gray-500">No URL threats found.</p>
            ) : (
              <ul className="space-y-2">
                {urlData.map((item, idx) => (
                  <li
  key={idx}
  className="text-lg text-gray-800 hover:text-blue-500 transition duration-200 cursor-pointer"
  onClick={() => window.location.href = `/attribute-detail/${encodeURIComponent(item)}`}
>
  {item}
</li>
                ))}
              </ul>
            )}

            {/* See More Button */}
            {urlData.length < allUrlData.length && (
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

export default URLThreats;
