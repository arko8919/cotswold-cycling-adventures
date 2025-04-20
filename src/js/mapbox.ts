/* eslint-disable */
import { type Location } from './types';

// Access the globally loaded MapboxGL (from CDN <script>) and tell TypeScript
// to treat it as if it were imported from the 'mapbox-gl' module for full type support
// "I didn't install module as there was some compatibility issues with other modules"
const mapbox = (window as any).mapboxgl as typeof import('mapbox-gl');

const displayMap = (locations: Location[]) => {
  mapbox.accessToken =
    'pk.eyJ1IjoiYXJrbzg5MTkiLCJhIjoiY203ODIyMTdxMDk4MTJxc2hmbGhlODJ6cSJ9.r0Eky05QnJLzmDKPf--oWw';

  // Initializes the map with a custom style and disables scroll zoom
  const map = new mapbox.Map({
    container: 'map', // Container ID
    style: 'mapbox://styles/arko8919/cm782fy6601yn01s2ciihcivh', // Style URL
    scrollZoom: false,
  });

  // Creates a box to hold map coordinates
  const bounds = new mapbox.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const marker = document.createElement('div');
    marker.className = 'marker';

    // Adds a marker and adjusts the map to include the location
    new mapbox.Marker({
      element: marker,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates) // Location
      .addTo(map); // Displays the marker on the map
    // Expands the map view to include the location
    bounds.extend(loc.coordinates);

    // Shows a popup with location details
    new mapbox.Popup({
      offset: 30, // location details
    })
      .setLngLat(loc.coordinates) // Position
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map); // Displays the popup on the map
  });

  //Adjusts map view to fit all locations
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
  window.scrollTo(0, 0);
};

export default displayMap;
