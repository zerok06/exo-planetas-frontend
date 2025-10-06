# Exoplanet Explorer Frontend

React + Vite frontend for 3D visualization and ML classification of Kepler exoplanets.

## Features

- **3D Visualization**: Interactive 3D galaxy scene with React Three Fiber
- **Planet Interaction**: Click planets to view details and get ML predictions
- **Real-time Classification**: Connect to FastAPI backend for ML predictions
- **Responsive Design**: Modern UI with smooth animations
- **Orbital Simulation**: Animated planets with realistic positioning

## Technologies

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Three Fiber** - 3D rendering with Three.js
- **React Three Drei** - 3D utilities and helpers
- **Framer Motion** - Animations and transitions
- **Axios** - HTTP client for API communication
- **Tailwind CSS** - Utility-first CSS framework

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage

### 3D Navigation
- **Rotate**: Click and drag to rotate the camera
- **Zoom**: Scroll wheel to zoom in/out
- **Pan**: Right-click and drag to pan the view

### Planet Interaction
- **Select**: Click on any planet to view its details
- **Analyze**: Selected planets automatically get ML predictions
- **Explore**: View physical properties, coordinates, and measurement errors

### Visual Indicators
- **Green Planets**: Confirmed exoplanets
- **Yellow Planets**: Candidate exoplanets
- **Blue Planets**: Currently selected
- **Purple Planets**: Unanalyzed planets

## API Integration

The frontend connects to the FastAPI backend at `http://localhost:8000`:

- **Health Check**: Monitors API availability
- **Prediction**: Sends exoplanet data for ML classification
- **Error Handling**: Graceful fallback for offline scenarios

## Project Structure

```
src/
├── components/
│   ├── GalaxyScene.jsx      # 3D scene with planets
│   ├── PlanetInfoPanel.jsx  # Planet details panel
│   └── Header.jsx          # App header with stats
├── services/
│   └── api.js              # API client and utilities
├── App.jsx                 # Main application
└── main.jsx               # Entry point
```

## Development

### Adding New Features
1. Create components in `src/components/`
2. Add API methods in `src/services/api.js`
3. Update state management in `App.jsx`

### Styling
- Uses Tailwind CSS for utility classes
- Custom styles in `index.css`
- Responsive design with mobile support

### 3D Development
- Three.js objects in `GalaxyScene.jsx`
- Animation with `useFrame` hook
- Interactive elements with event handlers

## Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.