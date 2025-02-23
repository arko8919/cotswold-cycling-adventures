/* eslint-disable */

const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYXJrbzg5MTkiLCJhIjoiY203ODIyMTdxMDk4MTJxc2hmbGhlODJ6cSJ9.r0Eky05QnJLzmDKPf--oWw';

  // Initializes the map with a custom style and disables scroll zoom
  const map = new mapboxgl.Map({
    container: 'map', // Container ID
    style: 'mapbox://styles/arko8919/cm782fy6601yn01s2ciihcivh', // Style URL
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds(); // Creates a box to hold map coordinates

  locations.forEach((loc) => {
    // Create marker
    const marker = document.createElement('div');
    marker.className = 'marker';

    // Adds a marker and adjusts the map to include the location
    new mapboxgl.Marker({
      element: marker,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates) // location
      .addTo(map); // Displays the marker on the map
    // Expands the map view to include the location
    bounds.extend(loc.coordinates);

    // Shows a popup with location details
    new mapboxgl.Popup({
      offset: 30, // location details
    })
      .setLngLat(loc.coordinates) // position
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
