import { useEffect, useRef, useState } from 'react';
import { Sun, Info, Telescope } from 'lucide-react';
import SolarSystem, { SolarSystemHandle } from './components/SolarSystem';
import PlanetInfo from './components/PlanetInfo';
import ExoplanetPanel from './components/ExoplanetPanel';
import { supabase, Exoplanet, HostStar } from './lib/supabase';
import { seedExoplanetsFromNASA } from './utils/exoplanetSeeder';

function App() {
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [selectedExoplanet, setSelectedExoplanet] = useState<Exoplanet | null>(null);
  const [showInfo, setShowInfo] = useState(true);
  const [showExoplanetPanel, setShowExoplanetPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const solarSystemRef = useRef<SolarSystemHandle>(null);

  useEffect(() => {
    initializeData();
  }, []);

  async function initializeData() {
    setIsLoading(true);
    await seedExoplanetsFromNASA();

    const { data: hostStars } = await supabase
      .from('host_stars')
      .select('*');

    if (hostStars) {
      hostStars.forEach((hostStar) => {
        solarSystemRef.current?.addHostStar(hostStar);
      });
    }

    const { data: exoplanets } = await supabase
      .from('exoplanets')
      .select('*');

    if (exoplanets) {
      exoplanets.forEach((exoplanet) => {
        solarSystemRef.current?.addExoplanet(exoplanet);
      });
    }

    setTimeout(() => setIsLoading(false), 1500);

    const hostStarSubscription = supabase
      .channel('host_stars_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'host_stars' }, (payload) => {
        solarSystemRef.current?.addHostStar(payload.new as HostStar);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'host_stars' }, (payload) => {
        solarSystemRef.current?.removeHostStar((payload.old as HostStar).id!);
      })
      .subscribe();

    const exoplanetSubscription = supabase
      .channel('exoplanets_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'exoplanets' }, (payload) => {
        solarSystemRef.current?.addExoplanet(payload.new as Exoplanet);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'exoplanets' }, (payload) => {
        solarSystemRef.current?.removeExoplanet((payload.old as Exoplanet).id!);
      })
      .subscribe();

    return () => {
      hostStarSubscription.unsubscribe();
      exoplanetSubscription.unsubscribe();
    };
  }

  function handleExoplanetSelect(exoplanet: Exoplanet | null) {
    setSelectedExoplanet(exoplanet);
    setSelectedPlanet(null);

    if (exoplanet?.id) {
      setTimeout(() => {
        solarSystemRef.current?.followExoplanet(exoplanet.id!);
      }, 50);
    }
  }

  function handlePlanetSelect(planet: string | null) {
    setSelectedPlanet(planet);
    setSelectedExoplanet(null);

    if (planet) {
      setTimeout(() => {
        solarSystemRef.current?.followPlanet(planet);
      }, 50);
    }
  }

  function handleNewSystemCreated(hostStar: HostStar, exoplanet: Exoplanet) {
    setTimeout(() => {
      setSelectedExoplanet(exoplanet);
      setSelectedPlanet(null);

      if (exoplanet.id) {
        solarSystemRef.current?.followExoplanet(exoplanet.id);
      }
    }, 200);
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <header className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sun className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">Interactive Solar System</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowExoplanetPanel(!showExoplanetPanel);
                if (showExoplanetPanel) {
                  setSelectedExoplanet(null);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500/80 hover:bg-orange-600 text-white rounded-lg transition-colors backdrop-blur-sm"
            >
              <Telescope className="w-5 h-5" />
              Exoplanets
            </button>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm"
            >
              <Info className="w-5 h-5" />
              {showInfo ? 'Hide' : 'Show'} Info
            </button>
          </div>
        </div>
      </header>

      <SolarSystem
        ref={solarSystemRef}
        onPlanetSelect={handlePlanetSelect}
        onExoplanetSelect={handleExoplanetSelect}
      />

      {showExoplanetPanel && (
        <ExoplanetPanel
          onClose={() => {
            setShowExoplanetPanel(false);
            setSelectedExoplanet(null);
          }}
          onExoplanetSelect={handleExoplanetSelect}
          selectedExoplanet={selectedExoplanet}
          onNewSystemCreated={handleNewSystemCreated}
        />
      )}

      {showInfo && !selectedExoplanet && (
        <PlanetInfo selectedPlanet={selectedPlanet} onClose={() => setSelectedPlanet(null)} />
      )}

      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-yellow-400/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-yellow-400 animate-spin"></div>
              <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-orange-500 animate-spin" style={{ animationDuration: '1.5s' }}></div>
              <Sun className="absolute inset-0 m-auto w-12 h-12 text-yellow-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">Loading Solar System</h2>
            <p className="text-white/60 animate-pulse">Initializing planetary data...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
