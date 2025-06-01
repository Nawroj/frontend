import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ThreatTypeChart from './ThreatTypeChart';
import EventCountsChart from './EventCountsChart';
import EventCategoriesChart from './EventCategoriesChart';

function Dashboard({ user }) {
  const [ipCount, setIpCount] = useState(null);
  const [domainCount, setDomainCount] = useState(null);
  const [urlCount, setUrlCount] = useState(null);
  const [hashCount, setHashCount] = useState(null);
  const [emailCount, setEmailCount] = useState(null);
  const [regkeyCount, setRegkeyCount] = useState(null);
  const [error, setError] = useState('');
  const [eventCounts, setEventCounts] = useState([]);
  const [eventCategories, setEventCategories] = useState([]);

  useEffect(() => {
    const fetchThreatData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        const axiosInstance = axios.create({
          headers: { Authorization: `Bearer ${token}` },
        });

        const [
          ip,
          domain,
          url,
          hash,
          email,
          regkey,
          eventCountsRes,
          eventCategoriesRes
        ] = await Promise.all([
          axiosInstance.get('http://localhost:8000/threats/ip_count'),
          axiosInstance.get('http://localhost:8000/threats/domain_count'),
          axiosInstance.get('http://localhost:8000/threats/url_count'),
          axiosInstance.get('http://localhost:8000/threats/hash_count'),
          axiosInstance.get('http://localhost:8000/threats/email_count'),
          axiosInstance.get('http://localhost:8000/threats/regkey_count'),
          axiosInstance.get('http://localhost:8000/threats/attr_count'),
          axiosInstance.get('http://localhost:8000/threats/event_categories'),
        ]);

        setIpCount(ip.data.ip_count.toString());
        setDomainCount(domain.data.domain_count.toString());
        setUrlCount(url.data.url_count.toString());
        setHashCount(hash.data.hash_count.toString());
        setEmailCount(email.data.email_count.toString());
        setRegkeyCount(regkey.data.regkey_count.toString());
        setEventCounts(eventCountsRes.data);
        setEventCategories(eventCategoriesRes.data);
      } catch (err) {
        console.error('Error fetching threat data:', err.message);
        setError('Failed to load threat data');
      }
    };

    fetchThreatData();
  }, [user.token]);

  return (
    <div className="min-h-screen bg-[#0E0B16]">
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

      {/* Main Dashboard Wrapper with Elevation */}
      <div className="max-w-7xl mx-auto mt-10 p-6 bg-[#161025] shadow-lg rounded-xl">
        <h2 className="text-3xl text-white font-semibold mb-4">Dashboard</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Wrapped Counts Section */}
        <div className="mb-10 bg-[#0E0B16] p-6 rounded shadow">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Link to="/ip-threats">
              <div
                style={{
                  backgroundColor: 'rgba(96, 80, 220, 0.7)',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(96, 80, 220, 1)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(96, 80, 220, 0.7)')}
                className="p-4 rounded shadow cursor-pointer text-white"
              >
                <h2 className="text-xl mb-2">IP Threats</h2>
                <p className="text-lg">{ipCount !== null ? `${ipCount} detected` : 'Loading...'}</p>
              </div>
            </Link>

            <Link to="/domain-threats">
              <div
                style={{
                  backgroundColor: 'rgba(213, 45, 183, 0.7)',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(213, 45, 183, 1)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(213, 45, 183, 0.7)')}
                className="p-4 rounded shadow cursor-pointer text-white"
              >
                <h2 className="text-xl mb-2">Domain Threats</h2>
                <p className="text-lg">{domainCount !== null ? `${domainCount} detected` : 'Loading...'}</p>
              </div>
            </Link>

            <Link to="/url-threats">
              <div
                style={{
                  backgroundColor: 'rgba(255, 107, 69, 0.7)',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 107, 69, 1)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 107, 69, 0.7)')}
                className="p-4 rounded shadow cursor-pointer text-white"
              >
                <h2 className="text-xl mb-2">URL Threats</h2>
                <p className="text-lg">{urlCount !== null ? `${urlCount} detected` : 'Loading...'}</p>
              </div>
            </Link>

            <Link to="/hash-threats">
              <div
                style={{
                  backgroundColor: 'rgba(255, 171, 5, 0.7)',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 171, 5, 1)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 171, 5, 0.7)')}
                className="p-4 rounded shadow cursor-pointer text-white"
              >
                <h2 className="text-xl mb-2">Hash Threats</h2>
                <p className="text-lg">{hashCount !== null ? `${hashCount} detected` : 'Loading...'}</p>
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/email-threats">
              <div
                style={{
                  backgroundColor: 'rgba(0, 200, 190, 0.7)',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 200, 190, 1)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 200, 190, 0.7)')}
                className="p-4 rounded shadow cursor-pointer text-white"
              >
                <h2 className="text-xl mb-2">Email Threats</h2>
                <p className="text-lg">{emailCount !== null ? `${emailCount} detected` : 'Loading...'}</p>
              </div>
            </Link>
            <Link to="/regkey-threats">
              <div
                style={{
                  backgroundColor: 'rgba(120, 200, 100, 0.7)',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(120, 200, 100, 1)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(120, 200, 100, 0.7)')}
                className="p-4 rounded shadow cursor-pointer text-white"
              >
                <h2 className="text-xl mb-2">Regkey Threats</h2>
                <p className="text-lg">{regkeyCount !== null ? `${regkeyCount} detected` : 'Loading...'}</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-[#0E0B16] p-6 rounded shadow">
          {/* Top Row - Two Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Threat Type Chart */}
            {(ipCount && domainCount && urlCount && hashCount) && (
              <div className="bg-gray-100 p-6 rounded shadow">
                <ThreatTypeChart
                  ipCount={parseInt(ipCount)}
                  domainCount={parseInt(domainCount)}
                  urlCount={parseInt(urlCount)}
                  hashCount={parseInt(hashCount)}
                  emailCount={parseInt(emailCount)}
                  regkeyCount={parseInt(regkeyCount)}
                />
              </div>
            )}

            {/* Event Counts Chart */}
            {eventCounts.length > 0 && (
              <div className="bg-gray-100 p-6 rounded shadow">
                <EventCountsChart data={eventCounts} />
              </div>
            )}
          </div>

          {/* Bottom Row - Full Width Event Categories Chart */}
          {eventCategories.length > 0 && (
            <div className="bg-gray-100 p-6 rounded shadow">
              <EventCategoriesChart data={eventCategories} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;