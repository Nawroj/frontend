import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiLogOut,
  FiInfo,
  FiTag,
  FiCalendar,
  FiShield,
  FiList,
} from 'react-icons/fi'; // Importing Feather icons for a modern look

function AttributeDetail() {
  const { value } = useParams();
  const [attributeData, setAttributeData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttribute = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/threats/attribute/${encodeURIComponent(value)}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        setAttributeData(response.data);
      } catch (err) {
        console.error(err.message);
        setError('Failed to fetch attribute details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttribute();
  }, [value]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col font-sans">
      {/* Header Section */}
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

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-8 text-center text-purple-300 drop-shadow-lg">
            Attribute Details:{' '}
            <span className="text-white break-all bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              {value}
            </span>
          </h1>

          {/* Conditional Rendering */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
              <p className="ml-4 text-gray-300 text-lg">Loading attribute data...</p>
            </div>
          ) : error ? (
            <div className="bg-red-900 bg-opacity-40 border border-red-700 text-red-300 p-6 rounded-xl text-center text-lg shadow-lg">
              <p>{error}</p>
            </div>
          ) : attributeData.length === 0 ? (
            <div className="bg-gray-800 bg-opacity-40 border border-gray-700 text-gray-400 p-6 rounded-xl text-center text-lg shadow-lg">
              <p>No data found for this attribute. It might not exist or there's an issue.</p>
            </div>
          ) : (
            <div
              className={`grid gap-8 ${
                attributeData.length === 1 ? 'grid-cols-1' : 'md:grid-cols-2 xl:grid-cols-2'
              }`}
            >
              {attributeData.map((attr, index) => (
                <div
                  key={index}
                  className="bg-gray-800 rounded-3xl p-8 shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.01] border border-gray-700"
                >
                  <h2 className="text-2xl font-bold mb-6 text-purple-400 flex items-center">
                    <FiInfo className="mr-3 text-purple-300" /> Attribute Information
                  </h2>

                  {/* Attribute Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-lg">
                    <div className="flex items-center">
                      <FiTag className="text-gray-500 mr-3" />
                      <span className="text-gray-400 font-medium">Category:</span>{' '}
                      <span className="text-white ml-2">{attr.category}</span>
                    </div>
                    <div className="flex items-center">
                      <FiList className="text-gray-500 mr-3" />
                      <span className="text-gray-400 font-medium">Type:</span>{' '}
                      <span className="text-white ml-2">{attr.type}</span>
                    </div>
                    <div className="flex items-center">
                      <FiShield className="text-gray-500 mr-3" />
                      <span className="text-gray-400 font-medium">To IDS:</span>{' '}
                      <span className="text-white ml-2">{attr.to_ids ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center">
                      <FiCalendar className="text-gray-500 mr-3" />
                      <span className="text-gray-400 font-medium">Created:</span>{' '}
                      <span className="text-white ml-2">
                        {attr.created_ts
                          ? new Date(attr.created_ts * 1000).toLocaleString()
                          : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Associated Event Data */}
                  {attr.event && (
                    <div className="mt-8 pt-8 border-t border-gray-700/60">
                      <h3 className="text-2xl font-bold mb-4 text-pink-400 flex items-center">
                        <FiInfo className="mr-3 text-pink-300" /> Associated Event
                      </h3>
                      <p className="text-lg text-gray-300 mb-4 leading-relaxed">
                        <span className="font-semibold text-pink-200">Description:</span>{' '}
                        {attr.event.info || 'No description available.'}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-base">
                        <div className="flex items-center">
                          <FiList className="text-gray-500 mr-3" />
                          <span className="text-gray-400 font-medium">Attribute Count:</span>{' '}
                          <span className="text-white ml-2">{attr.event.attribute_count}</span>
                        </div>
                        <div className="flex items-center">
                          <FiShield className="text-gray-500 mr-3" />
                          <span className="text-gray-400 font-medium">Threat Level:</span>{' '}
                          <span className="text-white ml-2">
                            {attr.event.threat_level_id || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <FiCalendar className="text-gray-500 mr-3" />
                          <span className="text-gray-400 font-medium">Event Date:</span>{' '}
                          <span className="text-white ml-2">
                            {attr.event.date
                              ? new Date(attr.event.date).toLocaleDateString()
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AttributeDetail;