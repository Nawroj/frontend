import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import axios from "axios";

// Props startDate and endDate will be ISO string dates, or null
const ThreatLevelChart = ({ startDate, endDate }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New color definitions from user
  const newBackgroundColors = [
    'rgba(96, 80, 220, 0.7)',    // For High
    'rgba(213, 45, 183, 0.7)',   // For Medium
    'rgba(255, 107, 69, 0.7)',   // For Low
    // Additional colors if more categories were present
    // 'rgba(255, 171, 5, 0.7)',
    // 'rgba(0, 200, 190, 0.7)',
    // 'rgba(120, 200, 100, 0.7)',
  ];

  const newBorderColors = [
    'rgba(96, 80, 220, 1)',      // For High
    'rgba(213, 45, 183, 1)',     // For Medium
    'rgba(255, 107, 69, 1)',     // For Low
    // Additional colors if more categories were present
    // 'rgba(255, 171, 5, 1)',
    // 'rgba(0, 200, 190, 1)',
    // 'rgba(120, 200, 100, 1)',
  ];


  useEffect(() => {
    const fetchThreatData = async () => {
      setLoading(true);
      setError(null);
      setChartData(null); 

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found. Please login.");
          setLoading(false);
          return;
        }

        const params = new URLSearchParams();
        if (startDate) {
          params.append('start_date_str', startDate);
        }
        if (endDate) {
          params.append('end_date_str', endDate);
        }
        const queryParams = params.toString() ? `?${params.toString()}` : '';

        const response = await axios.get(`http://localhost:8000/threats/threat-level-stats${queryParams}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setChartData(response.data);

      } catch (err) {
        console.error("Error fetching threat level chart data:", err.response ? err.response.data : err.message);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          setError('Session expired or invalid. Please login again.');
        } else if (err.response && err.response.data && err.response.data.detail) {
            setError(`Failed to load chart data: ${err.response.data.detail}`);
        } else {
          setError('Failed to load chart data. Check console for details.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchThreatData();
  }, [startDate, endDate]); 

  const handleBarClick = (event) => {
    if (!event.points || event.points.length === 0) return;

    const threatLabel = event.points[0].x;
    const threatLevelMap = { High: "1", Medium: "2", Low: "3" };
    const levelId = threatLevelMap[threatLabel];

    if (!levelId) {
        console.error("Could not determine threat level ID from click event.");
        alert("Could not fetch details for this threat level.");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication token not found. Please login.");
      return;
    }
    
    const params = new URLSearchParams();
    if (startDate) {
      params.append('start_date_str', startDate);
    }
    if (endDate) {
      params.append('end_date_str', endDate);
    }
    const queryParams = params.toString() ? `?${params.toString()}` : '';

    axios
      .get(`http://localhost:8000/threats/events-by-threat/${levelId}${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const eventList = res.data.join("\n") || "No events found for this level in the selected period.";
        alert(`Events in ${threatLabel} Threat Level (${startDate && endDate ? "filtered period" : "all time"}):\n\n${eventList}`);
      })
      .catch((err) => {
        console.error("Failed to fetch events by threat level", err);
        alert(`Unable to fetch event details for ${threatLabel} level. ${err.response?.data?.detail || ''}`);
      });
  };

  const threatLevelsIds = ["1", "2", "3"]; 
  const labels = ["High", "Medium", "Low"];
  
  const values = labels.map((label, index) => {
    const levelId = threatLevelsIds[index];
    return chartData && chartData[levelId] ? chartData[levelId] : 0;
  });

  const noDataAvailable = !values.some(value => value > 0);

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md min-h-[350px] flex flex-col">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 text-center">Events by Threat Level</h3>
      {loading && (
        <p className="text-center text-gray-500 flex-grow flex items-center justify-center">Loading chart data...</p>
      )}
      {!loading && error && (
        <p className="text-center text-red-500 flex-grow flex items-center justify-center">{error}</p>
      )}
      {!loading && !error && noDataAvailable && (
        <p className="text-center text-gray-500 flex-grow flex items-center justify-center">
          No event data available for Threat Levels in the selected period.
        </p>
      )}
      {!loading && !error && !noDataAvailable && (
        <div className="flex-grow w-full h-full">
          <Plot
            data={[
              {
                x: labels,
                y: values,
                type: "bar",
                hoverinfo: "x+y", // Changed to show x and y values on hover
                // 'text' property removed from here to prevent custom text on bars/hover
                marker: {
                  color: newBackgroundColors.slice(0, labels.length), // Use new background colors
                  line: { 
                    width: 1.5, 
                    color: newBorderColors.slice(0, labels.length) // Use new border colors
                  }, 
                  cornerradius: 6,
                },
              },
            ]}
            layout={{
              autosize: true,
              xaxis: {
                title: { text: "Threat Level", font: { size: 14, color: '#4b5563' } },
                tickfont: { color: '#6b7280' },
                automargin: true, 
              },
              yaxis: {
                title: { text: "Number of Events", font: { size: 14, color: '#4b5563' } },
                tickfont: { color: '#6b7280' },
                gridcolor: '#e5e7eb',
                rangemode: 'tozero', 
                autorange: true,     
                tickformat: 'd',     
                automargin: true, 
              },
              bargap: 0.35, 
              showlegend: false,
              plot_bgcolor: "#F3F4F6",    
              paper_bgcolor: "#F3F4F6",   
              margin: { t: 20, b: 50, l: 50, r: 20 }, 
              hoverlabel: { 
                bgcolor: "#ffffff", 
                font: { color: "#1f2937", size: 13 }, 
                bordercolor: '#d1d5db', 
                borderwidth: 1,
                namelength: -1, 
              },
            }}
            config={{
              displayModeBar: false,
              responsive: true,
            }}
            onClick={handleBarClick}
            className="w-full h-full"
          />
        </div>
      )}
    </div>
  );
};

export default ThreatLevelChart;