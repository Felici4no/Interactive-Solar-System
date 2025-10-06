import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { createSolarSystemScene } from '../utils/threeScene';
import { Exoplanet, HostStar } from '../lib/supabase';

interface SolarSystemProps {
  onPlanetSelect: (planet: string | null) => void;
  onExoplanetSelect: (exoplanetData: Exoplanet) => void;
  onHostStarSelect?: (hostStarData: HostStar) => void;
}

export interface SolarSystemHandle {
  addExoplanet: (exoplanet: Exoplanet) => void;
  removeExoplanet: (id: string) => void;
  clearExoplanets: () => void;
  addHostStar: (hostStar: HostStar) => void;
  removeHostStar: (id: string) => void;
  clearHostStars: () => void;
  focusOnPosition: (position: { x: number; y: number; z: number }, distance?: number) => void;
  followExoplanet: (exoplanetId: string) => void;
  followPlanet: (planetName: string) => void;
}

const SolarSystem = forwardRef<SolarSystemHandle, SolarSystemProps>(
  ({ onPlanetSelect, onExoplanetSelect, onHostStarSelect }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<ReturnType<typeof createSolarSystemScene> | null>(null);

    useImperativeHandle(ref, () => ({
      addExoplanet: (exoplanet: Exoplanet) => {
        sceneRef.current?.addExoplanet(exoplanet);
      },
      removeExoplanet: (id: string) => {
        sceneRef.current?.removeExoplanet(id);
      },
      clearExoplanets: () => {
        sceneRef.current?.clearExoplanets();
      },
      addHostStar: (hostStar: HostStar) => {
        sceneRef.current?.addHostStar(hostStar);
      },
      removeHostStar: (id: string) => {
        sceneRef.current?.removeHostStar(id);
      },
      clearHostStars: () => {
        sceneRef.current?.clearHostStars();
      },
      focusOnPosition: (position: { x: number; y: number; z: number }, distance?: number) => {
        const vec = new THREE.Vector3(position.x, position.y, position.z);
        sceneRef.current?.focusOnPosition(vec, distance);
      },
      followExoplanet: (exoplanetId: string) => {
        sceneRef.current?.followExoplanet(exoplanetId);
      },
      followPlanet: (planetName: string) => {
        sceneRef.current?.followPlanet(planetName);
      },
    }));

    useEffect(() => {
      if (!containerRef.current) return;

      const scene = createSolarSystemScene(containerRef.current);
      sceneRef.current = scene;

      scene.onPlanetClick((name, type, data) => {
        if (type === 'planet' || type === 'star') {
          onPlanetSelect(name);
        } else if (type === 'exoplanet' && data) {
          onExoplanetSelect(data);
        } else if (type === 'host_star' && data && onHostStarSelect) {
          onHostStarSelect(data);
        } else {
          onPlanetSelect(null);
        }
      });

      return () => {
        scene.cleanup();
      };
    }, [onPlanetSelect, onExoplanetSelect, onHostStarSelect]);

    return (
      <div
        ref={containerRef}
        className="w-full h-screen"
        style={{ cursor: 'grab' }}
      />
    );
  }
);

SolarSystem.displayName = 'SolarSystem';

export default SolarSystem;
