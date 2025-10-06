import { useState, useEffect } from 'react';
import { X, Plus, Telescope, Search } from 'lucide-react';
import { supabase, Exoplanet, HostStar } from '../lib/supabase';

interface ExoplanetPanelProps {
  onClose: () => void;
  onExoplanetSelect: (exoplanet: Exoplanet | null) => void;
  selectedExoplanet: Exoplanet | null;
  onNewSystemCreated?: (hostStar: HostStar, exoplanet: Exoplanet) => void;
}

function ExoplanetPanel({ onClose, onExoplanetSelect, selectedExoplanet, onNewSystemCreated }: ExoplanetPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [exoplanets, setExoplanets] = useState<Exoplanet[]>([]);
  const [hostStars, setHostStars] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<Exoplanet>>({
    name: '',
    distance_from_sun: '',
    discovery_date: '',
    mass: '',
    radius: '',
    orbital_period: '',
    temperature: '',
    host_star: '',
    discovery_method: '',
    observations: '',
    color: '#888888',
    size: 0.3,
  });

  useEffect(() => {
    loadExoplanets();
    loadHostStars();
  }, []);

  async function loadExoplanets() {
    const { data, error } = await supabase
      .from('exoplanets')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setExoplanets(data);
    }
  }

  async function loadHostStars() {
    const { data, error } = await supabase
      .from('host_stars')
      .select('hostname')
      .order('hostname');

    if (!error && data) {
      setHostStars(data.map((s) => s.hostname));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.host_star || !formData.name) {
      alert('Please fill in the exoplanet name and host star');
      return;
    }

    console.log('Creating exoplanet:', formData);

    let hostStarId: string | undefined;
    let newHostStar: HostStar | null = null;
    let existingHostStarData: HostStar | null = null;

    const { data: existingHostStar, error: queryError } = await supabase
      .from('host_stars')
      .select('*')
      .eq('hostname', formData.host_star)
      .maybeSingle();

    console.log('Existing host star query:', { existingHostStar, queryError });

    if (existingHostStar) {
      hostStarId = existingHostStar.id;
      existingHostStarData = existingHostStar;
      console.log('Using existing host star:', hostStarId);
    } else {
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 100;

      const newHostStarData: Partial<HostStar> = {
        hostname: formData.host_star,
        st_teff: 5000,
        st_rad: 1.0,
        st_dist_ly: 100 + Math.random() * 900,
        position_x: Math.cos(angle) * distance,
        position_y: (Math.random() - 0.5) * 30,
        position_z: Math.sin(angle) * distance,
        color: '#FDB813',
      };

      console.log('Creating new host star:', newHostStarData);

      const { data: createdHostStar, error: hostStarError } = await supabase
        .from('host_stars')
        .insert([newHostStarData])
        .select()
        .single();

      console.log('Host star creation result:', { createdHostStar, hostStarError });

      if (hostStarError || !createdHostStar) {
        console.error('Error creating host star:', hostStarError);
        alert('Error creating host star: ' + (hostStarError?.message || 'Unknown error'));
        return;
      }

      hostStarId = createdHostStar.id;
      newHostStar = createdHostStar;
      setHostStars([...hostStars, createdHostStar.hostname]);
    }

    const newExoplanet: Partial<Exoplanet> = {
      name: formData.name,
      distance_from_sun: formData.distance_from_sun || '',
      discovery_date: formData.discovery_date || '',
      mass: formData.mass || '',
      radius: formData.radius || '',
      orbital_period: formData.orbital_period || '',
      temperature: formData.temperature || '',
      host_star: formData.host_star,
      host_star_id: hostStarId,
      discovery_method: formData.discovery_method || '',
      observations: formData.observations || '',
      color: formData.color || '#888888',
      size: formData.size || 0.3,
      position_x: 0,
      position_y: 0,
      position_z: 0,
    };

    console.log('Creating exoplanet:', newExoplanet);

    const { data: createdExoplanet, error: exoplanetError } = await supabase
      .from('exoplanets')
      .insert([newExoplanet])
      .select()
      .single();

    console.log('Exoplanet creation result:', { createdExoplanet, exoplanetError });

    if (exoplanetError) {
      console.error('Error creating exoplanet:', exoplanetError);
      alert('Error creating exoplanet: ' + exoplanetError.message);
      return;
    }

    if (createdExoplanet) {
      setExoplanets([createdExoplanet, ...exoplanets]);
      setShowForm(false);
      setFormData({
        name: '',
        distance_from_sun: '',
        discovery_date: '',
        mass: '',
        radius: '',
        orbital_period: '',
        temperature: '',
        host_star: '',
        discovery_method: '',
        observations: '',
        color: '#888888',
        size: 0.3,
      });

      const hostStarToFocus = newHostStar || existingHostStarData;
      if (hostStarToFocus && onNewSystemCreated) {
        console.log('Calling onNewSystemCreated with:', hostStarToFocus, createdExoplanet);
        onNewSystemCreated(hostStarToFocus, createdExoplanet);
      }
    }
  }

  const filteredExoplanets = exoplanets.filter((planet) =>
    planet.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedExoplanet) {
    return (
      <div className="absolute top-24 left-6 w-96 bg-white/10 backdrop-blur-md p-6 rounded-lg text-white max-h-[calc(100vh-150px)] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Telescope className="w-6 h-6 text-orange-400" />
            <h2 className="text-2xl font-bold">{selectedExoplanet.name}</h2>
          </div>
          <button
            onClick={() => onExoplanetSelect(null)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <h3 className="font-semibold text-orange-400/80 mb-1">Host Star</h3>
            <p>{selectedExoplanet.host_star || 'N/A'}</p>
          </div>

          <div>
            <h3 className="font-semibold text-orange-400/80 mb-1">Distance from Solar System</h3>
            <p>{selectedExoplanet.distance_from_sun || 'N/A'}</p>
          </div>

          <div>
            <h3 className="font-semibold text-orange-400/80 mb-1">Discovery Date</h3>
            <p>{selectedExoplanet.discovery_date || 'N/A'}</p>
          </div>

          <div>
            <h3 className="font-semibold text-orange-400/80 mb-1">Discovery Method</h3>
            <p>{selectedExoplanet.discovery_method || 'N/A'}</p>
          </div>

          <div>
            <h3 className="font-semibold text-orange-400/80 mb-1">Mass</h3>
            <p>{selectedExoplanet.mass || 'N/A'}</p>
          </div>

          <div>
            <h3 className="font-semibold text-orange-400/80 mb-1">Radius</h3>
            <p>{selectedExoplanet.radius || 'N/A'}</p>
          </div>

          <div>
            <h3 className="font-semibold text-orange-400/80 mb-1">Orbital Period</h3>
            <p>{selectedExoplanet.orbital_period || 'N/A'}</p>
          </div>

          <div>
            <h3 className="font-semibold text-orange-400/80 mb-1">Temperature</h3>
            <p>{selectedExoplanet.temperature || 'N/A'}</p>
          </div>

          <div>
            <h3 className="font-semibold text-orange-400/80 mb-1">Observations</h3>
            <p className="text-white/80 leading-relaxed">{selectedExoplanet.observations || 'N/A'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-24 left-6 w-96 bg-white/10 backdrop-blur-md p-6 rounded-lg text-white max-h-[calc(100vh-150px)] flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Telescope className="w-6 h-6 text-orange-400" />
          <h2 className="text-xl font-bold">Exoplanets</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {!showForm ? (
        <>
          <button
            onClick={() => setShowForm(true)}
            className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add Exoplanet
          </button>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="text"
              placeholder="Search exoplanet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {filteredExoplanets.length === 0 ? (
              <p className="text-white/60 text-center py-4">No exoplanets found</p>
            ) : (
              filteredExoplanets.map((planet) => (
                <button
                  key={planet.id}
                  onClick={() => onExoplanetSelect(planet)}
                  className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: planet.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{planet.name}</p>
                      <p className="text-xs text-white/60 truncate">{planet.host_star}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-1">Exoplanet Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="e.g.: Kepler-452b"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Host Star *</label>
            <input
              type="text"
              required
              list="hostStars"
              value={formData.host_star}
              onChange={(e) => setFormData({ ...formData, host_star: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Type or select a star"
            />
            <datalist id="hostStars">
              {hostStars.map((star) => (
                <option key={star} value={star} />
              ))}
            </datalist>
            <p className="text-xs text-white/50 mt-1">
              Type a new name to create a new host star
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Distance</label>
            <input
              type="text"
              value={formData.distance_from_sun}
              onChange={(e) => setFormData({ ...formData, distance_from_sun: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="e.g.: 1400 light-years"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Discovery Date</label>
            <input
              type="text"
              value={formData.discovery_date}
              onChange={(e) => setFormData({ ...formData, discovery_date: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="e.g.: 2015"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Discovery Method</label>
            <input
              type="text"
              value={formData.discovery_method}
              onChange={(e) => setFormData({ ...formData, discovery_method: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="e.g.: Transit"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Mass</label>
            <input
              type="text"
              value={formData.mass}
              onChange={(e) => setFormData({ ...formData, mass: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="e.g.: 5 Earth masses"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Radius</label>
            <input
              type="text"
              value={formData.radius}
              onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="e.g.: 1.6 Earth radii"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Orbital Period</label>
            <input
              type="text"
              value={formData.orbital_period}
              onChange={(e) => setFormData({ ...formData, orbital_period: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="e.g.: 385 days"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Temperature</label>
            <input
              type="text"
              value={formData.temperature}
              onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="e.g.: 265 K"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Color (Hex)</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Size (0.1 - 3)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="3"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Observations</label>
            <textarea
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              placeholder="Add scientific observations..."
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors font-semibold"
            >
              Create
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default ExoplanetPanel;
