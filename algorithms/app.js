import { dijkstra, getPath } from "./algorithms/dijkstra.js";
import { greedyAssign } from "./algorithms/greedy.js";

// ============================================================
//  City Graph — nodes are locations, edges are distances (km)
//  You can add/remove locations and roads freely here.
// ============================================================
const cityGraph = {
  "Depot":        { "Restaurant A": 3, "Restaurant B": 5 },
  "Restaurant A": { "Depot": 3, "Zone 1": 4, "Zone 2": 6 },
  "Restaurant B": { "Depot": 5, "Zone 2": 3, "Zone 3": 7 },
  "Zone 1":       { "Restaurant A": 4, "Zone 2": 2, "Zone 4": 5 },
  "Zone 2":       { "Restaurant A": 6, "Restaurant B": 3, "Zone 1": 2, "Zone 3": 4, "Zone 5": 3 },
  "Zone 3":       { "Restaurant B": 7, "Zone 2": 4, "Zone 5": 2 },
  "Zone 4":       { "Zone 1": 5, "Zone 5": 1 },
  "Zone 5":       { "Zone 2": 3, "Zone 3": 2, "Zone 4": 1 },
};

// Precompute Dijkstra from every node
function buildAllDistances(graph) {
  const all = {};
  for (const node in graph) {
    const { distances, previous } = dijkstra(graph, node);
    all[node] = distances;
    all[`${node}_prev`] = previous;
  }
  return all;
}

const allDistances = buildAllDistances(cityGraph);

// ============================================================
//  Delivery Agents
// ============================================================
const agents = [
  { id: "Agent 1", currentLocation: "Depot" },
  { id: "Agent 2", currentLocation: "Depot" },
];

// ============================================================
//  Orders — populated dynamically from the form
// ============================================================
let orders = [];
let orderIdCounter = 1;

// ============================================================
//  DOM Helpers
// ============================================================
const locationNames = Object.keys(cityGraph);
const restaurants = locationNames.filter(n => n.startsWith("Restaurant"));
const zones       = locationNames.filter(n => n.startsWith("Zone"));

function populateSelect(selectId, options) {
  const sel = document.getElementById(selectId);
  sel.innerHTML = "";
  options.forEach(o => {
    const opt = document.createElement("option");
    opt.value = o;
    opt.textContent = o;
    sel.appendChild(opt);
  });
}

// ============================================================
//  AI Location Detection & Nearby Restaurants
// ============================================================
let aiCurrentLocation = "Depot";
let detectedNearbyRestaurants = [];

// Simulate AI detecting current location using geolocation-like logic
function detectCurrentLocation() {
  // Simulate AI detection with random location from graph (for demo purposes)
  // In a real app, this would use browser Geolocation API
  const possibleLocations = Object.keys(cityGraph);
  const randomIndex = Math.floor(Math.random() * possibleLocations.length);
  aiCurrentLocation = possibleLocations[randomIndex];
  
  // Find nearby restaurants
  findNearbyRestaurants();
  
  // Update UI
  updateAILocationDisplay();
  
  return aiCurrentLocation;
}

// Find nearby restaurants based on current location using Dijkstra distances
function findNearbyRestaurants() {
  const currentDistances = allDistances[aiCurrentLocation];
  if (!currentDistances) {
    detectedNearbyRestaurants = [];
    return;
  }
  
  // Get restaurants sorted by distance
  const restaurantDistances = restaurants.map(restaurant => ({
    name: restaurant,
    distance: currentDistances[restaurant] ?? Infinity
  }));
  
  // Sort by distance and take top 3
  restaurantDistances.sort((a, b) => a.distance - b.distance);
  detectedNearbyRestaurants = restaurantDistances.slice(0, 3);
  
  return detectedNearbyRestaurants;
}

// Update the AI location display in the UI
function updateAILocationDisplay() {
  const locationBar = document.getElementById("aiLocationBar");
  const nearbySection = document.getElementById("nearbyRestaurants");
  
  if (locationBar) {
    locationBar.innerHTML = `
      <div class="loc-dot"></div>
      <div class="loc-text">
        <strong>AI Detected Location:</strong> ${aiCurrentLocation}
      </div>
      <button class="loc-refresh" onclick="refreshAILocation()">Refresh</button>
    `;
  }
  
  if (nearbySection) {
    if (detectedNearbyRestaurants.length > 0) {
      nearbySection.innerHTML = detectedNearbyRestaurants.map(r => `
        <div class="nearby-item">
          <span class="nearby-name">${r.name}</span>
          <span class="nearby-dist">${r.distance} km</span>
        </div>
      `).join("");
    } else {
      nearbySection.innerHTML = '<p class="empty-msg">No nearby restaurants detected</p>';
    }
  }
}

// Refresh AI location
window.refreshAILocation = function() {
  detectCurrentLocation();
  showToast("Location updated!");
};

// Initialize AI location on load
window.addEventListener("DOMContentLoaded", () => {
  populateSelect("restaurantSelect", restaurants);
  populateSelect("destinationSelect", zones);
  
  // Initialize AI location detection
  detectCurrentLocation();

  document.getElementById("addOrderBtn").addEventListener("click", addOrder);
  document.getElementById("runBtn").addEventListener("click", runPlanner);
  document.getElementById("clearBtn").addEventListener("click", clearAll);
});

// ============================================================
//  Add Order
// ============================================================
function addOrder() {
  const restaurant  = document.getElementById("restaurantSelect").value;
  const destination = document.getElementById("destinationSelect").value;

  const order = { id: `Order #${orderIdCounter++}`, restaurant, destination };
  orders.push(order);
  renderOrderList();
}

function renderOrderList() {
  const list = document.getElementById("orderList");
  list.innerHTML = "";
  if (orders.length === 0) {
    list.innerHTML = `<p class="empty">No orders yet. Add one above.</p>`;
    return;
  }
  orders.forEach((o, i) => {
    const div = document.createElement("div");
    div.className = "order-item";
    div.innerHTML = `
      <span class="order-label">${o.id}</span>
      <span class="order-route">${o.restaurant} → ${o.destination}</span>
      <button class="remove-btn" onclick="removeOrder(${i})">✕</button>
    `;
    list.appendChild(div);
  });
}

window.removeOrder = function(index) {
  orders.splice(index, 1);
  renderOrderList();
};

// ============================================================
//  Run Planner
// ============================================================
function runPlanner() {
  if (orders.length === 0) {
    showToast("Add at least one order first!");
    return;
  }

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  // Greedy assignment
  const assignments = greedyAssign(orders, agents, allDistances);

  // For each assignment, compute full path using Dijkstra
  assignments.forEach(a => {
    // Path: agent's original location → restaurant → destination
    const prev1 = allDistances[`Depot_prev`];
    const path1 = getPath(prev1, a.restaurant);           // Depot → Restaurant

    const prev2 = allDistances[`${a.restaurant}_prev`];
    const path2 = getPath(prev2, a.destination);          // Restaurant → Destination

    // Merge paths (remove duplicate restaurant node)
    const fullPath = [...path1, ...path2.slice(1)];

    const totalDist =
      (allDistances["Depot"][a.restaurant] ?? 0) +
      (allDistances[a.restaurant][a.destination] ?? 0);

    const card = document.createElement("div");
    card.className = "result-card";
    card.innerHTML = `
      <div class="result-header">
        <span class="badge agent">${a.agentId}</span>
        <span class="badge order">${a.orderId}</span>
      </div>
      <div class="result-body">
        <div class="path-row">
          <span class="path-label">Dijkstra Path</span>
          <span class="path-value">${fullPath.join(" → ")}</span>
        </div>
        <div class="path-row">
          <span class="path-label">Total Distance</span>
          <span class="path-value highlight">${totalDist} km</span>
        </div>
        <div class="path-row">
          <span class="path-label">Restaurant</span>
          <span class="path-value">${a.restaurant}</span>
        </div>
        <div class="path-row">
          <span class="path-label">Delivers to</span>
          <span class="path-value">${a.destination}</span>
        </div>
        <div class="path-row">
          <span class="path-label">Distance to pick up</span>
          <span class="path-value">${a.distToRestaurant} km</span>
        </div>
      </div>
    `;
    resultsDiv.appendChild(card);
  });

  document.getElementById("resultsSection").style.display = "block";
  document.getElementById("resultsSection").scrollIntoView({ behavior: "smooth" });
}

// ============================================================
//  Clear
// ============================================================
function clearAll() {
  orders = [];
  orderIdCounter = 1;
  renderOrderList();
  document.getElementById("results").innerHTML = "";
  document.getElementById("resultsSection").style.display = "none";
}

// ============================================================
//  Toast notification
// ============================================================
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}