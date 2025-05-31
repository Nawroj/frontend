import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FiSearch, FiLogOut, FiArrowLeft, FiHardDrive, FiAlertTriangle, FiEye } from 'react-icons/fi'; // Added relevant icons

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
        setError('Failed to load registry key threats. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRegkeys();
  }, []);

  useEffect(() => {
    // This useEffect is no longer strictly needed if handleSeeMore directly updates regkeyData
    // but it's good practice to keep the slice logic here if `allRegkeyData` or `visibleKeyCount`
    // can change independently in other scenarios.
    setRegkeyData(allRegkeyData.slice(0, visibleKeyCount));
  }, [visibleKeyCount, allRegkeyData]);


  const handleSearch = () => {
    // Filter `allRegkeyData` for a more accurate search, not just `regkeyData` (which is paginated)
    const found = allRegkeyData.find((item) => item.toLowerCase() === searchKey.trim().toLowerCase());
    setMatchedKey(found || null);
  };

  const handleSeeMore = () => {
    const newVisibleCount = visibleKeyCount + 50;
    setVisibleKeyCount(newVisibleCount);
    // Directly update regkeyData with the new slice
    setRegkeyData(allRegkeyData.slice(0, newVisibleCount));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col font-sans">
      {/* Top Bar */}
      <header className="bg-gray-950 p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-gray-300 hover:text-purple-400 transition duration-300">
            <FiArrowLeft className="h-6 w-6" />
          </Link>
          <Link to="/">
            <img src="/logo.png" alt="ThreatPulse Logo" className="h-10 w-auto" />
          </Link>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/';
          }}
          className="flex items-center space-x-2 text-sm bg-red-700 hover:bg-red-800 text-white px-5 py-2 rounded-full transition duration-300 transform hover:scale-105 shadow-md"
        >
          <FiLogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 justify-center p-8">
        <div className="w-full max-w-5xl">
          <h1 className="text-4xl font-extrabold text-white mb-8 text-center drop-shadow-lg flex items-center justify-center">
            <FiHardDrive className="mr-4 text-purple-400" />
            Registry Key <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 ml-3">Threats</span>
          </h1>

          {error && (
            <div className="bg-red-900 bg-opacity-40 border border-red-700 text-red-300 p-4 rounded-xl text-center mb-6 shadow-md flex items-center justify-center space-x-2">
              <FiAlertTriangle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-8 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <input
              type="text"
              placeholder="Search a registry key (e.g., HKLM\SOFTWARE\Malware)"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              className="w-full sm:flex-grow p-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
            />
            <button
              onClick={handleSearch}
              className="w-full sm:w-auto bg-purple-600 text-white px-7 py-3 rounded-xl hover:bg-purple-700 transition duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
            >
              <FiSearch className="h-5 w-5" />
              <span>Search</span>
            </button>
          </div>

          {/* Search Result */}
          {searchKey && (
            <div className="text-center mb-8 p-4 rounded-xl shadow-md
              bg-gray-800 border border-gray-700">
              {matchedKey ? (
                <p className="text-green-400 text-lg flex items-center justify-center space-x-2">
                  <span className="text-2xl">🎉</span> <span>Registry Key found:</span> <strong className="break-all">{matchedKey}</strong>
                </p>
              ) : (
                <p className="text-red-400 text-lg flex items-center justify-center space-x-2">
                  <span className="text-2xl">😞</span> <span>Registry Key not found in threat list.</span>
                </p>
              )}
            </div>
          )}

          {/* RegKey Threat List */}
          <div className="bg-gray-800 rounded-2xl shadow-xl p-8 mt-4 border border-gray-700">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="w-16 h-16 border-t-4 border-b-4 border-purple-500 rounded-full animate-spin"></div>
                <p className="ml-4 text-gray-400 text-xl">Loading registry keys...</p>
              </div>
            ) : regkeyData.length === 0 ? (
              <p className="text-center text-gray-500 text-lg py-10">
                No registry key threats found at this time.
              </p>
            ) : (
              <ul className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar"> {/* Added custom-scrollbar class */}
                {regkeyData.map((item, idx) => (
                  <li
                    key={idx}
                    className="bg-gray-900 p-4 rounded-lg shadow-inner border border-gray-700
                               text-lg text-gray-300 hover:text-purple-300 hover:bg-gray-700
                               transition duration-300 cursor-pointer flex items-center justify-between group"
                    onClick={() => window.location.href = `/attribute-detail/${encodeURIComponent(item)}`}
                  >
                    <span className="break-all flex-grow">{item}</span>
                    <FiEye className="ml-4 text-gray-500 group-hover:text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </li>
                ))}
              </ul>
            )}

            {/* See More Button */}
            {regkeyData.length < allRegkeyData.length && (
              <div className="text-center mt-8">
                <button
                  onClick={handleSeeMore}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full
                             hover:from-purple-700 hover:to-pink-700 transition duration-300 transform hover:scale-105
                             shadow-lg flex items-center justify-center mx-auto space-x-2"
                >
                  <FiEye className="h-5 w-5" />
                  <span>See More ({allRegkeyData.length - regkeyData.length} remaining)</span>
                </button>
              </div>
            )}
            {regkeyData.length === allRegkeyData.length && allRegkeyData.length > 0 && (
              <p className="text-center text-gray-500 mt-6 text-sm">
                You've reached the end of the list.
              </p>
            )}
          </div>
        </div>
      </div>
      {/* Custom Scrollbar Style */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a202c; /* bg-gray-900, matching list item background */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #a78bfa; /* A shade of purple for the thumb */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #c084fc; /* Lighter purple on hover */
        }
      `}</style>
    </div>
  );
}

export default RegKeyThreats;