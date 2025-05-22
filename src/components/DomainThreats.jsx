import { useState, useEffect } from 'react';
import axios from 'axios';

function DomainThreats({ user }) {
  const [allDomainData, setAllDomainData] = useState([]);
  const [domainData, setDomainData] = useState([]);
  const [visibleDomainCount, setVisibleDomainCount] = useState(50);
  const [searchDomain, setSearchDomain] = useState('');
  const [matchedDomain, setMatchedDomain] = useState(null);
  const [error, setError] = useState('');

  // Fetch all domains once when component mounts or user.token changes
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await axios.get('http://localhost:8000/threats/domains', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setAllDomainData(response.data);
        setDomainData(response.data.slice(0, visibleDomainCount)); // Initially show 50
      } catch (err) {
        console.error(err.message);
        setError('Failed to load domain threats.');
      }
    };

    fetchDomains();
  }, [user.token]);

  // Update the visible domain list when visibleDomainCount changes
  useEffect(() => {
    setDomainData(allDomainData.slice(0, visibleDomainCount));
  }, [visibleDomainCount, allDomainData]);

  const handleSearch = () => {
    const found = allDomainData.find(
      (item) => item.toLowerCase() === searchDomain.trim().toLowerCase()
    );
    setMatchedDomain(found || null);
  };

  const handleSeeMore = () => {
    setVisibleDomainCount((prev) => prev + 50);
  };

  return (
    <div className="min-h-screen bg-[#0E0B16] flex flex-col">
      {/* Top Bar */}
      <div className="bg-[#161025] p-4 flex items-center justify-between shadow-md">
        <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
        <div />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 justify-center items-center p-6">
        <div className="w-full max-w-4xl">
          <h1 className="text-4xl font-semibold text-white mb-6 text-center">Domain Threats</h1>

          {/* Error Message */}
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

          {/* Search Bar */}
          <div className="mb-8 flex items-center justify-center space-x-4">
            <input
              type="text"
              placeholder="Enter domain to search..."
              value={searchDomain}
              onChange={(e) => setSearchDomain(e.target.value)}
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
          {searchDomain && (
            <div className="text-center mb-6">
              {matchedDomain ? (
                <p className="text-green-500">✅ Domain found: {matchedDomain}</p>
              ) : (
                <p className="text-red-500">❌ Domain not found in threat list</p>
              )}
            </div>
          )}

          {/* Domain Threat List */}
          <div className="bg-white rounded-lg shadow-lg p-6 mt-4">
            {domainData.length === 0 ? (
              <p className="text-center text-gray-500">No domain threats found.</p>
            ) : (
              <ul className="space-y-2">
                {domainData.map((item, idx) => (
                  <li
                    key={idx}
                    className="text-lg text-gray-800 hover:text-blue-500 transition duration-200"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}

            {/* See More Button */}
            {domainData.length < allDomainData.length && (
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

export default DomainThreats;
