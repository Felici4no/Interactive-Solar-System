import { X } from 'lucide-react';
import { planetData } from '../data/planetData';

interface PlanetInfoProps {
  selectedPlanet: string | null;
  onClose: () => void;
}

function PlanetInfo({ selectedPlanet, onClose }: PlanetInfoProps) {
  if (!selectedPlanet) {
    return (
      <div className="absolute top-24 right-6 w-80 bg-white/10 backdrop-blur-md p-6 rounded-lg text-white">
        <h2 className="text-xl font-bold mb-4">Explore the Solar System</h2>
        <p className="text-white/80">
          Click on any planet to see detailed information about it.
        </p>
      </div>
    );
  }

  const planet = planetData[selectedPlanet];

  if (!planet) return null;

  return (
    <div className="absolute top-24 right-6 w-80 bg-white/10 backdrop-blur-md p-6 rounded-lg text-white">
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-2xl font-bold">{planet.name}</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3 text-sm max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
        <div>
          <h3 className="font-semibold text-white/60 mb-1">Type</h3>
          <p>{planet.type}</p>
        </div>

        <div>
          <h3 className="font-semibold text-white/60 mb-1">Distance from Sun</h3>
          <p>{planet.distanceFromSun}</p>
        </div>

        <div>
          <h3 className="font-semibold text-white/60 mb-1">Diameter</h3>
          <p>{planet.diameter}</p>
        </div>

        <div>
          <h3 className="font-semibold text-white/60 mb-1">Mass</h3>
          <p>{planet.mass}</p>
        </div>

        <div>
          <h3 className="font-semibold text-white/60 mb-1">Orbital Period</h3>
          <p>{planet.orbitalPeriod}</p>
        </div>

        <div>
          <h3 className="font-semibold text-white/60 mb-1">Rotation Period</h3>
          <p>{planet.rotationPeriod}</p>
        </div>

        <div>
          <h3 className="font-semibold text-white/60 mb-1">Temperature</h3>
          <p>{planet.temperature}</p>
        </div>

        <div>
          <h3 className="font-semibold text-white/60 mb-1">Moons</h3>
          <p>{planet.moons}</p>
        </div>

        <div>
          <h3 className="font-semibold text-white/60 mb-1">About</h3>
          <p className="text-white/80 leading-relaxed">{planet.description}</p>
        </div>
      </div>
    </div>
  );
}

export default PlanetInfo;
