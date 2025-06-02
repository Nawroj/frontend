import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import axios from "axios";

const ThreatLevelChart = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchThreatData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found in localStorage");
          return;
        }

        const response = await axios.get("http://localhost:8000/threats/threat-level-stats", {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}); 

        setData(response.data);
      } catch (err) {
        console.error("Error fetching chart data:", err);
      }
    };

    fetchThreatData();
  }, []);

  if (!data) return <p className="text-white">Loading chart...</p>;

  const threatLevels = ["1", "2", "3"];
  const labels = ["High", "Medium", "Low"];
  const values = threatLevels.map(level => data[level] || 0);

  const handleBarClick = (event) => {
    const threatLabel = event.points[0].x;
    const threatLevelMap = { High: "1", Medium: "2", Low: "3" };
    const levelId = threatLevelMap[threatLabel];

    const token = localStorage.getItem("token");

    axios.get(`http://localhost:8000/threats/events-by-threat/${levelId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      const eventList = res.data.join("\n");
      alert(`Events in ${threatLabel} Threat Level:\n\n${eventList}`);
    })
    .catch(err => {
      console.error("Failed to fetch events by threat level", err);
      alert("Unable to fetch event details.");
    });
  };

  return (
    <Plot
    style={{
        borderRadius: "6px",              // ✅ Rounded corners
        backgroundColor: "F5F5F5",        // ✅ Chart background
        overflow: "hidden", 
      }}
      data={[
        {
          x: labels,
          y: values,
          type: "bar",
          //text: values.map((count, i) => `${count} events in ${labels[i]} level`),
          hoverinfo: values.map((count, i) => `${count} "events in" ${labels[i]} "level"`),
          marker: { color: ["#c1534a", "#f3812d", "#49aa46"] }
        }
      ]}
      layout={{
        title: {
            text: "Number of Events by Threat Level",
            font: {
              size: 20
            },
            xref: "paper",
            x: 0.5, // centers the title
          },
          xaxis: {
            title: {
              text: "Threat Level",
              font: {
                size: 16
              }
            }
          },
          yaxis: {
            title: {
              text: "Number of Events",
              font: {
                size: 16
              }
            },
            tickvals: [0, 500, 1000, 1500, 2000]
          },
          bargap: 0.5,
          showlegend: false,
          plot_bgcolor: "#f4f4f5",
          paper_bgcolor: "#f4f4f5",
      }}
      onClick={handleBarClick}
      config={{
        displayModeBar: false,  // Hide zoom/save buttons
        scrollZoom: false       // Prevent zooming
      }}
    />
  );
};


export default ThreatLevelChart;



