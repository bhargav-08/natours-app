/* eslint-disable */

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYmhhcmdhdjA4IiwiYSI6ImNsaWVodjhoNTA1cHQzZW1yMjQydmE1NzUifQ.ek-rbuk1_06SE21EuPpZhQ'

  let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/bhargav08/cliei8l8s001k01qpc2vh6e26',
    scrollZoom: false,
    // interactive:false // set this map as picture
    // zoom:11
    // center:[lat,lng] //start location
  })

  const bounds = new mapboxgl.LngLatBounds()

  locations.forEach((loc) => {
    // Create Marker element and attacted to map
    const el = document.createElement('div')
    el.className = 'marker'
    new mapboxgl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat(loc.coordinates)
      .addTo(map)

    // Create Popup and attached to map
    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day: ${loc.day} ${loc.description}</p>`)
      .addTo(map)

    bounds.extend(loc.coordinates)
  })

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  })
}
