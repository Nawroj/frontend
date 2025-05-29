import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'

function RegKeyThreats() {
  const [regkeyData, setRegkeyData] = useState([]);
  const [error, setError] = useState('');
  const [searchKey, setSearchKey] = useState('');
  const [matchedKey, setMatchedKey] = useState(null);
  const [visibleKeyCount, setVisibleKeyCount] = useState(50);
  const [allRegkeyData, setAllRegkeyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegkeys = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/threats/regkeys', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setAllRegkeyData(response.data);
        setRegkeyData(response.data.slice(0, 50));
      } catch (err) {
        console.error(err.message);
        setError('Failed to load registry key threats.');
      } finally {
      setLoading(false);
    }
    };

    fetchRegkeys();
  }, []);

  useEffect(() => {
    setRegkeyData(allRegkeyData.slice(0, visibleKeyCount));
  }, [visibleKeyCount, allRegkeyData]);

  const handleSearch = () => {
    const found = regkeyData.find((item) => item === searchKey.trim());
    setMatchedKey(found || null);
  };

  const handleSeeMore = () => {
    const newVisibleCount = visibleKeyCount + 50;
    setVisibleKeyCount(newVisibleCount);
    setRegkeyData(allRegkeyData.slice(0, newVisibleCount));
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
          <h1 className="text-4xl font-semibold text-white mb-6 text-center">Registry Key Threats</h1>

          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

          {/* Search Bar */}
          <div className="mb-8 flex items-center justify-center space-x-4">
            <input
              type="text"
              placeholder="Enter registry key to search..."
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              className="w-full sm:w-1/3 p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleSearch}
              className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition duration-200"
            >
              Search
            </button>
          </div>

          {/* Search Result */}
          {searchKey && (
            <div className="text-center mb-6">
              {matchedKey ? (
                <p className="text-green-500">✅ Registry Key found: {matchedKey}</p>
              ) : (
                <p className="text-red-500">❌ Registry Key not found in threat list</p>
              )}
            </div>
          )}

          {/* RegKey Threat List */}
          <div className="bg-white rounded-lg shadow-lg p-6 mt-4">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin" />
              </div>
            ) : regkeyData.length === 0 ? (
              <p className="text-center text-gray-500">No registry key threats found.</p>
            ) : (
              <ul className="space-y-2">
                {regkeyData.map((item, idx) => (
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
            {regkeyData.length < allRegkeyData.length && (
              <div className="text-center mt-6">
                <button
                  onClick={handleSeeMore}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition duration-200"
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

export default RegKeyThreats;
