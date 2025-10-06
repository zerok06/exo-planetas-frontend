import React, { useState, useEffect } from 'react';

function App() {
  const [exoplanets, setExoplanets] = useState([]);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [apiStatus, setApiStatus] = useState('unknown');

  // Generate sample exoplanets
  useEffect(() => {
    const samplePlanets = [];
    for (let i = 0; i < 10; i++) {
      samplePlanets.push({
        koi_name: `KOI-${1000 + i}`,
        ra: Math.random() * 360,
        dec: (Math.random() - 0.5) * 180,
        koi_period: 1 + Math.random() * 1000,
        koi_depth: 0.001 + Math.random() * 0.1,
        koi_duration: 1 + Math.random() * 20,
        koi_impact: Math.random(),
        koi_model_snr: 5 + Math.random() * 45,
      });
    }
    setExoplanets(samplePlanets);
  }, []);

  // Check API health
  useEffect(() => {
    const checkAPI = async () => {
      try {
        const response = await fetch('http://localhost:8000/health');
        const data = await response.json();
        setApiStatus(data.model_loaded ? 'healthy' : 'degraded');
      } catch (error) {
        console.error('API check failed:', error);
        setApiStatus('error');
      }
    };

    checkAPI();
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0f0f23 0%, #16213e 50%, #1a1a2e 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <header style={{ 
        background: 'rgba(0,0,0,0.8)', 
        padding: '20px', 
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px' }}>🌌 Exoplanet Explorer</h1>
          <p style={{ margin: '5px 0 0 0', color: '#ccc' }}>NASA Kepler Data Visualization & ML Classification</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ 
            padding: '5px 10px', 
            borderRadius: '20px',
            background: apiStatus === 'healthy' ? '#4ade80' : apiStatus === 'degraded' ? '#fbbf24' : '#ef4444',
            color: 'white',
            fontSize: '12px'
          }}>
            {apiStatus === 'healthy' ? '🟢 API Connected' : 
             apiStatus === 'degraded' ? '🟡 API Limited' : '🔴 API Offline'}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ padding: '20px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px',
          marginBottom: '20px'
        }}>
          {exoplanets.map((planet, index) => (
            <div
              key={planet.koi_name}
              onClick={() => setSelectedPlanet(planet)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: selectedPlanet?.koi_name === planet.koi_name ? '2px solid #3b82f6' : '1px solid #333',
                borderRadius: '10px',
                padding: '15px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: selectedPlanet?.koi_name === planet.koi_name ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              <h3 style={{ margin: '0 0 10px 0', color: '#3b82f6' }}>{planet.koi_name}</h3>
              <div style={{ fontSize: '14px', color: '#ccc' }}>
                <div>Period: {planet.koi_period?.toFixed(2)} days</div>
                <div>Depth: {(planet.koi_depth * 1000)?.toFixed(3)} ppm</div>
                <div>Duration: {planet.koi_duration?.toFixed(2)} hours</div>
                <div>SNR: {planet.koi_model_snr?.toFixed(1)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Planet Details */}
        {selectedPlanet && (
          <div style={{
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid #333',
            borderRadius: '10px',
            padding: '20px',
            marginTop: '20px'
          }}>
            <h2 style={{ margin: '0 0 15px 0', color: '#3b82f6' }}>
              {selectedPlanet.koi_name} Details
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <strong>Physical Properties:</strong>
                <div style={{ marginTop: '5px', fontSize: '14px' }}>
                  <div>Orbital Period: {selectedPlanet.koi_period?.toFixed(2)} days</div>
                  <div>Transit Depth: {(selectedPlanet.koi_depth * 1000)?.toFixed(3)} ppm</div>
                  <div>Transit Duration: {selectedPlanet.koi_duration?.toFixed(2)} hours</div>
                  <div>Impact Parameter: {selectedPlanet.koi_impact?.toFixed(3)}</div>
                </div>
              </div>
              <div>
                <strong>Coordinates:</strong>
                <div style={{ marginTop: '5px', fontSize: '14px' }}>
                  <div>RA: {selectedPlanet.ra?.toFixed(3)}°</div>
                  <div>Dec: {selectedPlanet.dec?.toFixed(3)}°</div>
                </div>
              </div>
              <div>
                <strong>Signal Quality:</strong>
                <div style={{ marginTop: '5px', fontSize: '14px' }}>
                  <div>SNR: {selectedPlanet.koi_model_snr?.toFixed(1)}</div>
                  <div style={{ 
                    color: selectedPlanet.koi_model_snr > 20 ? '#4ade80' : 
                           selectedPlanet.koi_model_snr > 10 ? '#fbbf24' : '#ef4444'
                  }}>
                    Quality: {selectedPlanet.koi_model_snr > 20 ? 'High' : 
                             selectedPlanet.koi_model_snr > 10 ? 'Medium' : 'Low'}
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedPlanet(null)}
              style={{
                marginTop: '15px',
                padding: '8px 16px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Close Details
            </button>
          </div>
        )}

        {/* Instructions */}
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid #333',
          borderRadius: '10px',
          padding: '20px',
          marginTop: '20px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>🌌 Kepler Exoplanet System</h3>
          <p style={{ margin: '0', color: '#ccc' }}>
            Click on any planet to view its details and get ML predictions
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#999' }}>
            Backend: http://localhost:8000 | Frontend: http://localhost:5173
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;

