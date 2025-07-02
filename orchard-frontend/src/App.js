import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const styles = {
  container: {
    maxWidth: 900,
    margin: '20px auto',
    padding: '30px 20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#1a202c',
    borderRadius: 12,
    boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
    color: '#e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    minHeight: '100vh',
    boxSizing: 'border-box',
  },
  title: {
    textAlign: 'center',
    color: '#63b3ed',
    marginBottom: 20,
    fontWeight: '700',
    fontSize: '2.4rem',
  },
  formRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '15px',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    flex: '0 0 160px',
    fontWeight: '700',
    color: '#90cdf4',
    fontSize: '1rem',
  },
  input: {
    flex: '1 1 220px',
    padding: '10px 15px',
    fontSize: '1rem',
    borderRadius: 8,
    border: '2px solid #2d3748',
    backgroundColor: '#2d3748',
    color: '#e2e8f0',
    outline: 'none',
    transition: 'border-color 0.3s, box-shadow 0.3s',
  },
  inputFocus: {
    borderColor: '#63b3ed',
    boxShadow: '0 0 8px #63b3ed',
  },
  rangeValue: {
    marginLeft: 15,
    minWidth: 45,
    fontWeight: '700',
    color: '#63b3ed',
    fontSize: '1.1rem',
  },
  button: {
    width: '100%',
    padding: '15px 0',
    fontSize: '1.2rem',
    fontWeight: '700',
    backgroundColor: '#3182ce',
    color: 'white',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'background-color 0.3s, box-shadow 0.3s',
    boxShadow: '0 5px 15px rgba(49,130,206,0.6)',
  },
  buttonHover: {
    backgroundColor: '#63b3ed',
    boxShadow: '0 6px 20px rgba(99,179,237,0.8)',
  },
  buttonDisabled: {
    backgroundColor: '#4a5568',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  results: {
    marginTop: 30,
    textAlign: 'center',
    color: '#e2e8f0',
  },
  errorMsg: {
    color: '#f56565',
    marginBottom: 15,
    fontWeight: '700',
    fontSize: '1rem',
    textAlign: 'center',
  },
};

function App() {
  const [scanDate, setScanDate] = useState('');
  const [harvestDate, setHarvestDate] = useState('');
  const [growthRate, setGrowthRate] = useState('');
  const [minDiameter, setMinDiameter] = useState(20);
  const [maxDiameter, setMaxDiameter] = useState(120);
  const [histogram, setHistogram] = useState([]);
  const [avgSize, setAvgSize] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [btnHover, setBtnHover] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!scanDate || !harvestDate || !growthRate) {
      setError('Please fill all required inputs.');
      return;
    }
    if (new Date(harvestDate) <= new Date(scanDate)) {
      setError('Harvest date must be after scan date.');
      return;
    }
    if (minDiameter > maxDiameter) {
      setError('Min diameter cannot be greater than max diameter.');
      return;
    }

    setLoading(true);
    setAvgSize(null);
    setHistogram([]);

    try {
      const response = await fetch('https://fruit-backend-service-245190431388.us-central1.run.app/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scan_date: scanDate,
          harvest_date: harvestDate,
          growth_rate: parseFloat(growthRate),
          min_diameter: parseFloat(minDiameter),
          max_diameter: parseFloat(maxDiameter),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      setAvgSize(data.average_diameter);

      const binWidth = 20;
      const histogramWithLabels = data.histogram.map(({ bin_start, count }) => ({
        widthRange: `${bin_start}–${bin_start + binWidth} mm`,
        count,
      }));

      if (histogramWithLabels.every(h => typeof h.count === 'number' && typeof h.widthRange === 'string')) {
        setHistogram(histogramWithLabels);
      } else {
        setHistogram([]);
        console.warn('Invalid histogram data:', histogramWithLabels);
      }
    } catch (e) {
      setError('Failed to connect to backend: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Fruit Harvest Width Estimator</h1>

      {error && <div style={styles.errorMsg}>{error}</div>}

      <div style={styles.formRow}>
        <label style={styles.label} htmlFor="scanDate">Scan Date *</label>
        <input
          style={styles.input}
          type="date"
          id="scanDate"
          value={scanDate}
          onChange={e => setScanDate(e.target.value)}
        />
      </div>

      <div style={styles.formRow}>
        <label style={styles.label} htmlFor="harvestDate">Harvest Date *</label>
        <input
          style={styles.input}
          type="date"
          id="harvestDate"
          value={harvestDate}
          onChange={e => setHarvestDate(e.target.value)}
        />
      </div>

      <div style={styles.formRow}>
        <label style={styles.label} htmlFor="growthRate">Growth Rate (mm/day) *</label>
        <input
          style={styles.input}
          type="number"
          id="growthRate"
          min="0"
          value={growthRate}
          onChange={e => setGrowthRate(e.target.value)}
          placeholder="e.g. 0.05"
        />
      </div>

      <div style={styles.formRow}>
        <label style={styles.label} htmlFor="minDiameter">Min Diameter (mm)</label>
        <input
          type="range"
          id="minDiameter"
          min="20"
          max="120"
          value={minDiameter}
          onChange={e => setMinDiameter(Number(e.target.value))}
          style={{ flex: '1 1 auto' }}
        />
        <span style={styles.rangeValue}>{minDiameter}</span>
      </div>

      <div style={styles.formRow}>
        <label style={styles.label} htmlFor="maxDiameter">Max Diameter (mm)</label>
        <input
          type="range"
          id="maxDiameter"
          min="20"
          max="120"
          value={maxDiameter}
          onChange={e => setMaxDiameter(Number(e.target.value))}
          style={{ flex: '1 1 auto' }}
        />
        <span style={styles.rangeValue}>{maxDiameter}</span>
      </div>

      <button
        style={{
          ...styles.button,
          ...(loading ? styles.buttonDisabled : {}),
          ...(btnHover && !loading ? styles.buttonHover : {}),
        }}
        onClick={handleSubmit}
        onMouseEnter={() => setBtnHover(true)}
        onMouseLeave={() => setBtnHover(false)}
        disabled={loading}
      >
        {loading ? 'Calculating...' : 'Submit'}
      </button>

      {avgSize !== null && (
        <div style={styles.results}>
          <h2>Average Predicted Width: {avgSize.toFixed(2)} mm</h2>

          {Array.isArray(histogram) && histogram.length > 0 && histogram.every(h => h.widthRange && typeof h.count === 'number') ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={histogram} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="widthRange"
                  angle={-60}
                  textAnchor="end"
                  interval={Math.max(1, Math.floor(histogram.length / 10))}
                  height={80}
                  tick={{ fontSize: 13, fill: '#a0aec0' }}
                />
                <YAxis stroke="#a0aec0" />
                <Tooltip
                  formatter={(value) => [value, 'Count']}
                  labelFormatter={(label) => `Width range: ${label}`}
                  contentStyle={{ backgroundColor: '#2d3748', borderRadius: 8, border: 'none' }}
                  itemStyle={{ color: '#e2e8f0' }}
                  labelStyle={{ color: '#63b3ed', fontWeight: '700' }}
                />
                <Bar dataKey="count" fill="#63b3ed" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No valid histogram data to display.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;