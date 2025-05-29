import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom'

function AttributeDetail() {
  const { value } = useParams();
  const [attributeData, setAttributeData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttribute = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/threats/attribute/${encodeURIComponent(value)}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setAttributeData(response.data);
      } catch (err) {
        console.error(err.message);
        setError('Failed to fetch attribute details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttribute();
  }, [value]);

  return (
    <div className="min-h-screen bg-[#0E0B16] text-white flex flex-col">
      {/* Header */}
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
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-center">
  <h1 className="text-3xl font-bold mb-6">
    <span className="text-white-300 break-all">{value}</span>
  </h1>
</div>

        {loading ? (
          <p className="text-gray-300">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : attributeData.length === 0 ? (
          <p className="text-gray-400">No data found.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
            {attributeData.map((attr, index) => (
              <div
                key={index}
                className="bg-[#1A1A2E] rounded-2xl p-6 shadow-md hover:shadow-xl transition duration-300"
              >
                <div className="mb-2">
                  <span className="text-gray-400 font-semibold">Category:</span>{' '}
                  <span className="text-white">{attr.category}</span>
                </div>
                <div className="mb-2">
                  <span className="text-gray-400 font-semibold">Type:</span>{' '}
                  <span className="text-white">{attr.type}</span>
                </div>
                <div className="mb-2 break-words">
                  <span className="text-gray-400 font-semibold">UUID:</span>{' '}
                  <span className="text-white">{attr.uuid}</span>
                </div>
                <div className="mb-2">
                  <span className="text-gray-400 font-semibold">To IDS:</span>{' '}
                  <span className="text-white">{attr.to_ids ? 'Yes' : 'No'}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold">Created:</span>{' '}
                  <span className="text-white">
                    {attr.created_ts ? new Date(attr.created_ts * 1000).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default AttributeDetail;
