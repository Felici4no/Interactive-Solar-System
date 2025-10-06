import { supabase } from '../lib/supabase';

const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY;

export async function seedExoplanetsFromNASA() {
  try {
    const response = await fetch(
      `https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=select+top+100+pl_name,hostname,disc_year,pl_masse,pl_rade,pl_orbper,pl_eqt,discoverymethod,sy_dist+from+ps+where+default_flag=1&format=json`
    );

    if (!response.ok) {
      console.error('Failed to fetch exoplanet data from NASA');
      return;
    }

    const data = await response.json();

    const { data: existingCount } = await supabase
      .from('exoplanets')
      .select('id', { count: 'exact', head: true });

    if (existingCount && existingCount.length > 0) {
      console.log('Exoplanets already seeded');
      return;
    }

    const exoplanets = data.map((planet: any, index: number) => {
      const angle = (index / data.length) * Math.PI * 2;
      const distance = 80 + Math.random() * 60;

      return {
        name: planet.pl_name || `Exoplanet-${index}`,
        distance_from_sun: planet.sy_dist
          ? `${(planet.sy_dist * 3.262).toFixed(2)} anos-luz`
          : 'Desconhecida',
        discovery_date: planet.disc_year ? `${planet.disc_year}` : 'Desconhecida',
        mass: planet.pl_masse
          ? `${planet.pl_masse.toFixed(3)} massas terrestres`
          : 'Desconhecida',
        radius: planet.pl_rade
          ? `${planet.pl_rade.toFixed(3)} raios terrestres`
          : 'Desconhecido',
        orbital_period: planet.pl_orbper
          ? `${planet.pl_orbper.toFixed(2)} dias`
          : 'Desconhecido',
        temperature: planet.pl_eqt
          ? `${planet.pl_eqt.toFixed(0)} K`
          : 'Desconhecida',
        host_star: planet.hostname || 'Desconhecida',
        discovery_method: planet.discoverymethod || 'Desconhecido',
        observations: `Exoplaneta descoberto orbitando ${planet.hostname || 'estrela desconhecida'}. Dados obtidos do NASA Exoplanet Archive.`,
        color: getExoplanetColor(planet.pl_eqt, planet.pl_rade),
        position_x: Math.cos(angle) * distance,
        position_y: (Math.random() - 0.5) * 20,
        position_z: Math.sin(angle) * distance,
        size: planet.pl_rade ? Math.max(0.2, Math.min(planet.pl_rade * 0.3, 2)) : 0.3,
      };
    });

    const { error } = await supabase
      .from('exoplanets')
      .insert(exoplanets);

    if (error) {
      console.error('Error seeding exoplanets:', error);
    } else {
      console.log(`Successfully seeded ${exoplanets.length} exoplanets`);
    }
  } catch (error) {
    console.error('Error in seedExoplanetsFromNASA:', error);
  }
}

function getExoplanetColor(temperature?: number, radius?: number): string {
  if (temperature) {
    if (temperature > 1500) return '#ff4500';
    if (temperature > 1000) return '#ff8c00';
    if (temperature > 500) return '#ffa500';
    if (temperature > 300) return '#4682b4';
    return '#4169e1';
  }

  if (radius) {
    if (radius > 10) return '#ffa500';
    if (radius > 5) return '#4682b4';
    return '#6495ed';
  }

  return '#888888';
}
