"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const mapElement = document.getElementById("tourMap");
  if (!mapElement || typeof L === "undefined") return;

  const northernPakistanCenter = [35.35, 74.65];
  const map = L.map(mapElement, {
    center: northernPakistanCenter,
    zoom: 7,
    minZoom: 4,
    maxZoom: 18,
    scrollWheelZoom: true,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" rel="noopener noreferrer">OpenStreetMap</a> contributors',
  }).addTo(map);

  const destinations = [
    {
      name: "Hunza Valley",
      description: "A scenic mountain valley known for forts, apricot blossoms, and views of Rakaposhi.",
      coordinates: [36.3167, 74.65],
    },
    {
      name: "Skardu",
      description: "Gateway to high peaks, lakes, cold desert landscapes, and adventure routes.",
      coordinates: [35.2971, 75.6333],
    },
    {
      name: "Fairy Meadows",
      description: "A famous alpine meadow with dramatic views of Nanga Parbat.",
      coordinates: [35.3875, 74.5789],
    },
  ];

  const safeGreenIcon = L.divIcon({
    className: "custom-marker",
    html:
      '<span style="display:block;width:18px;height:18px;border-radius:999px;background:#16a34a;border:3px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,.35)"></span>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

  destinations.forEach((destination) => {
    const popupNode = createSafePopup(destination.name, destination.description);

    L.marker(destination.coordinates, { icon: safeGreenIcon })
      .addTo(map)
      .bindPopup(popupNode);
  });

  function createSafePopup(name, description) {
    const wrapper = document.createElement("div");

    const title = document.createElement("h2");
    title.className = "popup-title";
    title.textContent = String(name);

    const copy = document.createElement("p");
    copy.className = "popup-description";
    copy.textContent = String(description);

    wrapper.append(title, copy);
    return wrapper;
  }
});
