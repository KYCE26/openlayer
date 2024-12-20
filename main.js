import Map from 'https://cdn.skypack.dev/ol/Map.js';
import View from 'https://cdn.skypack.dev/ol/View.js';
import OSM from 'https://cdn.skypack.dev/ol/source/OSM.js';
import TileLayer from 'https://cdn.skypack.dev/ol/layer/Tile.js';
import VectorLayer from 'https://cdn.skypack.dev/ol/layer/Vector.js';
import VectorSource from 'https://cdn.skypack.dev/ol/source/Vector.js';
import Feature from 'https://cdn.skypack.dev/ol/Feature.js';
import Point from 'https://cdn.skypack.dev/ol/geom/Point.js';
import { Fill, RegularShape, Stroke, Style } from 'https://cdn.skypack.dev/ol/style.js';
import { fromLonLat } from 'https://cdn.skypack.dev/ol/proj.js';

// Define styles for the wind arrow
const shaft = new RegularShape({
  points: 2,
  radius: 15,
  stroke: new Stroke({
    width: 2,
    color: 'black',
  }),
  rotateWithView: true,
});

const head = new RegularShape({
  points: 3,
  radius: 5,
  fill: new Fill({
    color: 'black',
  }),
  rotateWithView: true,
});

const styles = [new Style({ image: shaft }), new Style({ image: head })];

const source = new VectorSource();

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    new VectorLayer({
      source: source,
      style: function (feature) {
        const wind = feature.get('wind');
        const angle = ((wind.deg - 180) * Math.PI) / 180; // Rotate arrow against wind
        const scale = wind.speed / 10; // Scale by wind speed
        shaft.setScale([1, scale]);
        shaft.setRotation(angle);
        head.setDisplacement([0, head.getRadius() / 2 + shaft.getRadius() * scale]);
        head.setRotation(angle);
        return styles;
      },
    }),
  ],
  view: new View({
    center: fromLonLat([117.5, -2.5]), // Center of Indonesia
    zoom: 4,
  }),
});

// Fetch weather data from OpenWeather
const API_KEY = 'c0dd7ea77ea92d679be1c2557c52bea8';

// Example locations in Indonesia
const locations = [
  { lat: -6.2088, lon: 106.8456 }, // Jakarta
  { lat: -7.797068, lon: 110.370529 }, // Yogyakarta
  { lat: -8.409518, lon: 115.188916 }, // Bali
  { lat: 1.455556, lon: 124.794167 }, // Manado
  { lat: -3.3285, lon: 114.5908 }, // Banjarmasin
  { lat: -5.147665, lon: 119.432732 }, // Makassar
  { lat: 2.736, lon: 99.5296 }, // Medan
  { lat: 0.5333, lon: 101.45 }, // Pekanbaru
  { lat: -0.0243, lon: 109.3400 }, // Pontianak
  { lat: 3.5952, lon: 98.6722 }, // Banda Aceh
  { lat: -7.250445, lon: 112.768845 }, // Surabaya
  { lat: -6.914744, lon: 107.609810 }, // Bandung
  { lat: -7.005145, lon: 110.438125 }, // Semarang
  { lat: -3.991267, lon: 122.512974 }, // Kendari
  { lat: -2.990934, lon: 104.756554 }, // Palembang
  { lat: -8.579892, lon: 116.095239 }, // Mataram
  { lat: -2.53371, lon: 140.71813 }, // Jayapura
  { lat: -0.8969, lon: 100.3484 }, // Padang
  { lat: -7.71629, lon: 113.3285 }, // Banyuwangi
  { lat: 1.481857, lon: 124.845735 }, // Bitung
  { lat: -1.2397, lon: 116.8639 }, // Samarinda
];

locations.forEach((location) => {
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${API_KEY}`
  )
    .then((response) => response.json())
    .then((data) => {
      const wind = {
        speed: data.wind.speed, // Wind speed (m/s)
        deg: data.wind.deg,     // Wind direction (degrees)
      };
      const feature = new Feature(
        new Point(fromLonLat([location.lon, location.lat]))
      );
      feature.set('wind', wind);
      source.addFeature(feature);
    });
});
