import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FiSearch, FiLogOut, FiArrowLeft, FiHardDrive, FiAlertTriangle, FiEye, FiInfo, FiCalendar } from 'react-icons/fi';

function RegKeyThreats() {
  const [allRegkeyData, setAllRegkeyData] = useState([]);
  const [regkeyData, setRegkeyData] = useState([]);
  const [visibleKeyCount, setVisibleKeyCount] = useState(50);
  const [searchKey, setSearchKey] = useState('');
  const [matchedKey, setMatchedKey] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // State for Date Filters
  const [dateRange, setDateRange] = useState('24h');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Helper Function to Get Query Dates
  const getQueryDates = () => {
    const now = new Date();
    let startDate, endDate = now;
    switch (dateRange) {
      case '24h': startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
      case '7d': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case '1m': startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate(), 0, 0, 0, 0); break;
      case '1y': startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate(), 0, 0, 0, 0); break;
      case 'custom':
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate); startDate.setHours(0, 0, 0, 0);
          endDate = new Date(customEndDate); endDate.setHours(23, 59, 59, 999);
        } else { return { startDate: null, endDate: null }; }
        break;
      case 'all': default: return { startDate: null, endDate: null };
    }
    if (dateRange !== 'custom' && endDate > now) endDate = now;
    if (dateRange !== 'custom' && startDate > now) startDate = new Date(now.getTime() - (dateRange === '24h' ? 24*60*60*1000 : 7*24*60*60*1000));
    return {
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
    };
  };

  useEffect(() => {
    const fetchRegkeys = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found. Please log in.');
          setLoading(false);
          setAllRegkeyData([]); setRegkeyData([]);
          return;
        }

        const { startDate, endDate } = getQueryDates();
        const params = new URLSearchParams();
        if (startDate) params.append('start_date_str', startDate);
        if (endDate) params.append('end_date_str', endDate);
        const queryParams = params.toString() ? `?${params.toString()}` : '';

        const response = await axios.get(`http://localhost:8000/threats/regkeys${queryParams}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllRegkeyData(response.data);
        // setRegkeyData(response.data.slice(0, 50)); // Handled by other useEffect
        setMatchedKey(null);
      } catch (err) {
        console.error(err.response ? err.response.data : err.message);
        setError(err.response?.data?.detail || 'Failed to load registry key threats. Please try again later.');
        setAllRegkeyData([]); setRegkeyData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRegkeys();
  }, [dateRange, customStartDate, customEndDate]);

  useEffect(() => {
    setRegkeyData(allRegkeyData.slice(0, visibleKeyCount));
  }, [visibleKeyCount, allRegkeyData]);

  useEffect(() => {
    setVisibleKeyCount(50);
    setMatchedKey(null);
  }, [dateRange, customStartDate, customEndDate]);

  const handleSearch = () => {
    const trimmedSearch = searchKey.trim().toLowerCase();
    if(!trimmedSearch){
        setMatchedKey(null);
        return;
    }
    const found = allRegkeyData.find((item) => item.value.toLowerCase() === trimmedSearch);
    setMatchedKey(found || null);
  };

  const handleSeeMore = () => {
    setVisibleKeyCount((prev) => prev + 50);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col font-sans">
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
          onClick={() => { localStorage.removeItem('token'); window.location.href = '/'; }}
          className="flex items-center space-x-2 text-sm bg-red-700 hover:bg-red-800 text-white px-5 py-2 rounded-full transition duration-300 transform hover:scale-105 shadow-md"
        >
          <FiLogOut className="h-4 w-4" /> <span>Logout</span>
        </button>
      </header>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="w-full max-w-5xl mx-auto">
          <h1 className="text-4xl font-extrabold text-white mb-8 text-center drop-shadow-lg flex items-center justify-center">
            <FiHardDrive className="mr-4 text-purple-400" />
            Registry Key <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 ml-3">Threats</span>
          </h1>

          {error && (
            <div className="bg-red-900 bg-opacity-40 border border-red-700 text-red-300 p-4 rounded-xl text-center mb-6 shadow-md flex items-center justify-center space-x-2">
              <FiAlertTriangle className="h-5 w-5" /> <p>{error}</p>
            </div>
          )}

          <div className="mb-6 p-4 bg-gray-800 bg-opacity-50 rounded-xl shadow flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border border-gray-700">
            <FiCalendar className="h-5 w-5 text-purple-400 mr-2 shrink-0" />
            <label htmlFor="dateRangeFilter" className="text-white mr-2 shrink-0">Filter by date:</label>
            <select
              id="dateRangeFilter" value={dateRange}
              onChange={(e) => { setDateRange(e.target.value); if (e.target.value !== 'custom') { setCustomStartDate(''); setCustomEndDate(''); }}}
              className="bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
            >
              <option value="all">All Time</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="1m">Last Month</option>
              <option value="1y">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
            {dateRange === 'custom' && (
              <>
                <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm" style={{ colorScheme: 'dark' }} max={new Date().toISOString().split("T")[0]}/>
                <span className="text-white">to</span>
                <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm" style={{ colorScheme: 'dark' }} max={new Date().toISOString().split("T")[0]} min={customStartDate || undefined} />
              </>
            )}
          </div>

          <div className="mb-8 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <input
              type="text" placeholder="Search a registry key (e.g., HKLM\\SOFTWARE\\Malware)"
              value={searchKey} onChange={(e) => setSearchKey(e.target.value)}
              className="w-full sm:flex-grow p-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
            />
            <button
              onClick={handleSearch}
              className="w-full sm:w-auto bg-purple-600 text-white px-7 py-3 rounded-xl hover:bg-purple-700 transition duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
            >
              <FiSearch className="h-5 w-5" /> <span>Search</span>
            </button>
          </div>

          {searchKey && (
            <div className="text-center mb-8 p-4 rounded-xl shadow-md bg-gray-800 border border-gray-700">
              {matchedKey ? (
                <div>
                  <p className="text-green-400 text-lg flex items-center justify-center space-x-2">
                    <span className="text-2xl">🎉</span> <span>Registry Key found:</span> <strong className="break-all">{matchedKey.value}</strong>
                  </p>
                  {matchedKey.event_info && (
                     <p className="text-gray-300 text-sm mt-1 flex items-center justify-center space-x-1">
                        <FiInfo className="h-4 w-4 text-purple-400 shrink-0" />
                        <span>Event: {matchedKey.event_info}</span>
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-red-400 text-lg flex items-center justify-center space-x-2">
                  <span className="text-2xl">😞</span> <span>Registry Key not found in the current filtered list.</span>
                </p>
              )}
            </div>
          )}

          <div className="bg-gray-800 rounded-2xl shadow-xl p-8 mt-4 border border-gray-700">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="w-16 h-16 border-t-4 border-b-4 border-purple-500 rounded-full animate-spin"></div>
                <p className="ml-4 text-gray-400 text-xl">Loading registry keys...</p>
              </div>
            ) : regkeyData.length === 0 ? (
              <p className="text-center text-gray-500 text-lg py-10">
                No registry key threats found for the selected period.
              </p>
            ) : (
              <ul className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {regkeyData.map((item, idx) => (
                  <li
                    key={`${item.value}-${idx}`}
                    className="bg-gray-900 p-4 rounded-lg shadow-inner border border-gray-700 text-gray-300 hover:bg-gray-700 transition duration-300 cursor-pointer flex items-center justify-between group"
                    onClick={() => window.location.href = `/attribute-detail/${encodeURIComponent(item.value)}`}
                  >
                    <div className="flex-grow flex items-center mr-3 overflow-hidden">
                      <span title={item.value} className="text-lg hover:text-purple-300 font-medium whitespace-nowrap overflow-hidden text-ellipsis pr-2">{item.value}</span>
                      {item.event_info && (
                        <div title={item.event_info} className="ml-2 pl-2 border-l border-gray-600 text-xs text-gray-400 group-hover:text-gray-300 flex items-center space-x-1 shrink-0">
                            <FiInfo className="h-3 w-3 text-purple-500 shrink-0" />
                            <span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] sm:max-w-[200px] md:max-w-[250px]">{item.event_info}</span>
                        </div>
                      )}
                    </div>
                    <FiEye className="text-gray-500 group-hover:text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0" />
                  </li>
                ))}
              </ul>
            )}

            {regkeyData.length < allRegkeyData.length && !loading && (
              <div className="text-center mt-8">
                <button
                  onClick={handleSeeMore}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full hover:from-purple-700 hover:to-pink-700 transition duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center mx-auto space-x-2"
                >
                  <FiEye className="h-5 w-5" />
                  <span>See More ({allRegkeyData.length - regkeyData.length} remaining)</span>
                </button>
              </div>
            )}
            {regkeyData.length === allRegkeyData.length && allRegkeyData.length > 0 && !loading && (
              <p className="text-center text-gray-500 mt-6 text-sm">
                You've reached the end of the list.
              </p>
            )}
          </div>
        </div>
      </main>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1a202c; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #a78bfa; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #c084fc; }
      `}</style>
    </div>
  );
}

export default RegKeyThreats;