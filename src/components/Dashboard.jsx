import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ThreatTypeChart from './ThreatTypeChart';
import EventCountsChart from './EventCountsChart';
import ThreatLevelChart from "./ThreatLevelChart";
import EventCategoriesChart from './EventCategoriesChart';
import { FiCalendar } from 'react-icons/fi'; // For Date Filter UI

function Dashboard({ user }) {
  const [ipCount, setIpCount] = useState(null);
  const [domainCount, setDomainCount] = useState(null);
  const [urlCount, setUrlCount] = useState(null);
  const [hashCount, setHashCount] = useState(null);
  const [emailCount, setEmailCount] = useState(null);
  const [regkeyCount, setRegkeyCount] = useState(null);
  const [error, setError] = useState('');
  const [eventCounts, setEventCounts] = useState([]); // For EventCountsChart (unfiltered)
  const [eventCategories, setEventCategories] = useState([]); // For EventCategoriesChart (filtered)
  const [loading, setLoading] = useState(true);


  // State for Date Filters
  const [dateRange, setDateRange] = useState('24h'); // Default to 'Last 24 hours'
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
    const fetchThreatData = async () => {
      setLoading(true);
      setError('');
      // Reset counts to null to show loading state
      setIpCount(null); setDomainCount(null); setUrlCount(null);
      setHashCount(null); setEmailCount(null); setRegkeyCount(null);
      // Do not reset eventCounts here if it's meant to be always all-time and fetched once or differently
      // setEventCounts([]); // If you want it to also show loading, but it's fetched without filters
      setEventCategories([]);


      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No token found. Please login again.');
          setLoading(false);
          return;
        }

        const axiosInstance = axios.create({
          headers: { Authorization: `Bearer ${token}` },
        });

        const { startDate, endDate } = getQueryDates();
        const params = new URLSearchParams();
        if (startDate) params.append('start_date_str', startDate);
        if (endDate) params.append('end_date_str', endDate);
        const queryParamsWithDateFilters = params.toString() ? `?${params.toString()}` : '';

        // Fetch data that SHOULD be filtered by date
        const [
          ipRes, domainRes, urlRes, hashRes, emailRes, regkeyRes, eventCategoriesRes
        ] = await Promise.all([
          axiosInstance.get(`http://localhost:8000/threats/ip_count${queryParamsWithDateFilters}`),
          axiosInstance.get(`http://localhost:8000/threats/domain_count${queryParamsWithDateFilters}`),
          axiosInstance.get(`http://localhost:8000/threats/url_count${queryParamsWithDateFilters}`),
          axiosInstance.get(`http://localhost:8000/threats/hash_count${queryParamsWithDateFilters}`),
          axiosInstance.get(`http://localhost:8000/threats/email_count${queryParamsWithDateFilters}`),
          axiosInstance.get(`http://localhost:8000/threats/regkey_count${queryParamsWithDateFilters}`),
          axiosInstance.get(`http://localhost:8000/threats/event_categories${queryParamsWithDateFilters}`),
        ]);

        // Fetch data for EventCountsChart separately WITHOUT date filters
        const eventCountsResponse = await axiosInstance.get('http://localhost:8000/threats/attr_count');

        setIpCount(ipRes.data.ip_count.toString());
        setDomainCount(domainRes.data.domain_count.toString());
        setUrlCount(urlRes.data.url_count.toString());
        setHashCount(hashRes.data.hash_count.toString());
        setEmailCount(emailRes.data.email_count.toString());
        setRegkeyCount(regkeyRes.data.regkey_count.toString());
        
        setEventCounts(eventCountsResponse.data); // Data from the unfiltered endpoint
        setEventCategories(eventCategoriesRes.data);

      } catch (err) {
        console.error('Error fetching threat data:', err.response ? err.response.data : err.message);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          setError('Session expired or invalid. Please login again.');
          localStorage.removeItem('token');
        } else if (err.response && err.response.data && err.response.data.detail) {
            setError(`Failed to load threat data: ${err.response.data.detail}`);
        } else {
          setError('Failed to load threat data. Check console for details.');
        }
        // Clear data on error
        setIpCount(null); setDomainCount(null); setUrlCount(null);
        setHashCount(null); setEmailCount(null); setRegkeyCount(null);
        setEventCounts([]); setEventCategories([]);
      } finally {
        setLoading(false);
      }
    };

    // Using user?.token in dependency if `user` prop is consistently updated upon auth changes.
    // If token is managed purely by localStorage and App.jsx redirects,
    // this effect runs on mount and when date filters change.
    if (user?.token || localStorage.getItem('token')) { // Check both user prop and localStorage for robustness
      fetchThreatData();
    } else {
       setError('User authentication token not found. Please login.');
       setLoading(false);
       // Clear data if no token
        setIpCount(null); setDomainCount(null); setUrlCount(null);
        setHashCount(null); setEmailCount(null); setRegkeyCount(null);
        setEventCounts([]); setEventCategories([]);
    }
  }, [user?.token, dateRange, customStartDate, customEndDate]);

  return (
    <div className="min-h-screen bg-[#0E0B16]">
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

      <div className="max-w-7xl mx-auto mt-10 p-6 bg-[#161025] shadow-lg rounded-xl">
        <h2 className="text-3xl text-white font-semibold mb-4">Dashboard</h2>

        <div className="mb-6 p-4 bg-[#0E0B16] rounded shadow flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 border border-gray-700">
            <FiCalendar className="h-5 w-5 text-purple-400 mr-0 sm:mr-2 shrink-0" />
            <label htmlFor="dateRangeFilter" className="text-white mr-2 shrink-0">Filter by date:</label>
            <select
              id="dateRangeFilter"
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                if (e.target.value !== 'custom') {
                  setCustomStartDate('');
                  setCustomEndDate('');
                }
              }}
              className="bg-[#161025] text-white border border-gray-600 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
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
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-[#161025] text-white border border-gray-600 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                  style={{ colorScheme: 'dark' }}
                  max={new Date().toISOString().split("T")[0]}
                />
                <span className="text-white hidden sm:inline">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-[#161025] text-white border border-gray-600 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                  style={{ colorScheme: 'dark' }}
                  max={new Date().toISOString().split("T")[0]}
                  min={customStartDate || undefined}
                />
              </>
            )}
        </div>
        
        {error && <p className="text-red-500 mb-4 p-3 bg-red-900 bg-opacity-30 border border-red-700 rounded">{error}</p>}
        {loading && <p className="text-purple-400 mb-4">Loading dashboard data...</p>}


        <div className="mb-10 bg-[#0E0B16] p-6 rounded shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* IP Threats Card */}
            <Link to="/ip-threats">
              <div
                style={{ backgroundColor: 'rgba(96, 80, 220, 0.7)', transition: 'background-color 0.2s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(96, 80, 220, 1)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(96, 80, 220, 0.7)')}
                className="p-4 rounded shadow cursor-pointer text-white"
              >
                <h2 className="text-xl mb-2">IP Threats</h2>
                <p className="text-lg">{loading && ipCount === null ? 'Loading...' : (ipCount !== null ? `${ipCount} detected` : 'N/A')}</p>
              </div>
            </Link>
            {/* Domain Threats Card */}
            <Link to="/domain-threats">
              <div
                style={{ backgroundColor: 'rgba(213, 45, 183, 0.7)', transition: 'background-color 0.2s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(213, 45, 183, 1)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(213, 45, 183, 0.7)')}
                className="p-4 rounded shadow cursor-pointer text-white"
              >
                <h2 className="text-xl mb-2">Domain Threats</h2>
                <p className="text-lg">{loading && domainCount === null ? 'Loading...' : (domainCount !== null ? `${domainCount} detected` : 'N/A')}</p>
              </div>
            </Link>
            {/* URL Threats Card */}
            <Link to="/url-threats">
              <div
                style={{ backgroundColor: 'rgba(255, 107, 69, 0.7)', transition: 'background-color 0.2s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 107, 69, 1)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 107, 69, 0.7)')}
                className="p-4 rounded shadow cursor-pointer text-white"
              >
                <h2 className="text-xl mb-2">URL Threats</h2>
                <p className="text-lg">{loading && urlCount === null ? 'Loading...' : (urlCount !== null ? `${urlCount} detected` : 'N/A')}</p>
              </div>
            </Link>
            {/* Hash Threats Card */}
            <Link to="/hash-threats">
              <div
                style={{ backgroundColor: 'rgba(255, 171, 5, 0.7)', transition: 'background-color 0.2s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 171, 5, 1)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 171, 5, 0.7)')}
                className="p-4 rounded shadow cursor-pointer text-white"
              >
                <h2 className="text-xl mb-2">Hash Threats</h2>
                <p className="text-lg">{loading && hashCount === null ? 'Loading...' : (hashCount !== null ? `${hashCount} detected` : 'N/A')}</p>
              </div>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email Threats Card */}
            <Link to="/email-threats">
              <div
                style={{ backgroundColor: 'rgba(0, 200, 190, 0.7)', transition: 'background-color 0.2s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 200, 190, 1)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 200, 190, 0.7)')}
                className="p-4 rounded shadow cursor-pointer text-white"
              >
                <h2 className="text-xl mb-2">Email Threats</h2>
                <p className="text-lg">{loading && emailCount === null ? 'Loading...' : (emailCount !== null ? `${emailCount} detected` : 'N/A')}</p>
              </div>
            </Link>
            {/* Regkey Threats Card */}
            <Link to="/regkey-threats">
              <div
                style={{ backgroundColor: 'rgba(120, 200, 100, 0.7)', transition: 'background-color 0.2s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(120, 200, 100, 1)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(120, 200, 100, 0.7)')}
                className="p-4 rounded shadow cursor-pointer text-white"
              >
                <h2 className="text-xl mb-2">Regkey Threats</h2>
                <p className="text-lg">{loading && regkeyCount === null ? 'Loading...' : (regkeyCount !== null ? `${regkeyCount} detected` : 'N/A')}</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Chart Section Wrapper */}
        <div className="bg-[#0E0B16] p-6 rounded shadow space-y-8"> {/* Added space-y-8 for vertical spacing between chart rows */}

          {/* --- Row 1: Threat Types Distribution & Events by Attribute Count --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Card 1: Threat Type Chart (Filtered by Dashboard Date Range) */}
            <div className="bg-gray-100 p-6 rounded-lg shadow-md min-h-[350px] flex flex-col">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 text-center">Threat Types Distribution</h3>
              {loading && (ipCount === null) && <p className="text-center text-gray-500 flex-grow flex items-center justify-center">Loading data...</p>}
              {!loading && error && (ipCount === null) && <p className="text-center text-red-500 flex-grow flex items-center justify-center">Could not load Threat Types data.</p>}
              {!loading && !error && (ipCount === null || domainCount === null || urlCount === null || hashCount === null || emailCount === null || regkeyCount === null) &&
                <p className="text-center text-gray-500 flex-grow flex items-center justify-center">No data available for Threat Types for the selected period.</p>
              }
              {!loading && !error && ipCount !== null && domainCount !== null && urlCount !== null && hashCount !== null && emailCount !== null && regkeyCount !== null && (
                <div className="flex-grow"> {/* Ensure chart takes available space */}
                  <ThreatTypeChart
                    ipCount={parseInt(ipCount) || 0}
                    domainCount={parseInt(domainCount) || 0}
                    urlCount={parseInt(urlCount) || 0}
                    hashCount={parseInt(hashCount) || 0}
                    emailCount={parseInt(emailCount) || 0}
                    regkeyCount={parseInt(regkeyCount) || 0}
                  />
                </div>
              )}
            </div>

            {/* Card 2: Event Counts Chart (All Time - Not affected by Dashboard Date Range) */}
            <div className="bg-gray-100 p-6 rounded-lg shadow-md min-h-[350px] flex flex-col">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 text-center">Events by Attribute Count (All Time)</h3>
              {loading && eventCounts.length === 0 && <p className="text-center text-gray-500 flex-grow flex items-center justify-center">Loading data...</p>}
              {!loading && error && eventCounts.length === 0 && <p className="text-center text-red-500 flex-grow flex items-center justify-center">Could not load Event Counts data.</p>}
              {!loading && !error && eventCounts.length === 0 &&
                <p className="text-center text-gray-500 flex-grow flex items-center justify-center">No data available for Event Counts.</p>
              }
              {!loading && !error && eventCounts.length > 0 && (
                 <div className="flex-grow">
                  <EventCountsChart data={eventCounts} />
                </div>
              )}
            </div>
          </div>
          <ThreatLevelChart />

          {/* --- Row 2: Attribute Categories Distribution --- */}
          {/* This chart will take the full width of its row */}
          <div>
            {/* Card 3: Event Categories Chart (Filtered by Dashboard Date Range) */}
            <div className="bg-gray-100 p-6 rounded-lg shadow-md min-h-[350px] flex flex-col">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 text-center">Attribute Categories Distribution</h3>
              {loading && eventCategories.length === 0 && <p className="text-center text-gray-500 flex-grow flex items-center justify-center">Loading data...</p>}
              {!loading && error && eventCategories.length === 0 && <p className="text-center text-red-500 flex-grow flex items-center justify-center">Could not load Attribute Categories data.</p>}
              {!loading && !error && eventCategories.length === 0 &&
                 <p className="text-center text-gray-500 flex-grow flex items-center justify-center">No data available for Attribute Categories for the selected period.</p>
              }
              {!loading && !error && eventCategories.length > 0 && (
                <div className="flex-grow">
                  <EventCategoriesChart data={eventCategories} />
                </div>
              )}
            </div>
          </div>
          
          {/* Global loading message if still loading primary data and no specific chart placeholder has kicked in */}
          {/* This might be redundant if individual chart placeholders are effective */}
          {/* {loading && (ipCount === null && eventCategories.length === 0 && eventCounts.length === 0) &&
             <div className="text-center text-purple-400 py-10 col-span-1 lg:col-span-2">Loading dashboard charts...</div>
          } */}
        </div>
      </div> {/* End of max-w-7xl container */}
    </div> // End of min-h-screen
  );
}

export default Dashboard;