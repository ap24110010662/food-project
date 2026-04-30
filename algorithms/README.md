# RouteDash — Food Delivery Route Planner

A web-based food delivery route planning application that uses Dijkstra's shortest path algorithm and greedy agent assignment to optimize delivery routes in Kurnool.

## 🚀 Features

- **Dijkstra's Algorithm** — Computes shortest paths between all locations in the city graph
- **Greedy Agent Assignment** — Assigns delivery orders to the nearest available agent
- **Interactive Map** — Visual representation of the delivery network with nodes and edges
- **Order Management** — Add and track delivery orders with restaurant and destination
- **Real-time Assignments** — See which agent handles each order and the distance

## 📁 Project Structure

```
algorithms/
├── app.js          # Main application logic & UI handling
├── dijkstra.js     # Dijkstra's shortest path algorithm implementation
├── greedy.js       # Greedy agent assignment algorithm
├── index.html      # Frontend UI with interactive map
└── style.css       # Styling for the application
```

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Algorithms**: Dijkstra's Shortest Path, Greedy Assignment
- **Fonts**: Syne (headings), DM Sans (body)

## 📊 How It Works

### City Graph
The application models a city with:
- **Depot**: Central distribution point
- **Restaurants**: Food pickup locations (Restaurant A, Restaurant B)
- **Zones**: Delivery destinations (Zone 1-5)

### Algorithm Flow
1. **Precomputation**: Dijkstra's algorithm runs from every node to compute all-pairs shortest paths
2. **Order Assignment**: When an order is placed, the greedy algorithm finds the nearest agent to the restaurant
3. **Path Visualization**: The shortest route is displayed on the interactive map

### Sample Graph
```
Depot ←→ Restaurant A (3km) ←→ Zone 1 (4km)
  │           ↓                    ↓
Restaurant B (5km)    Zone 2 ←→ Zone 4
  ↓           ↓           ↓          ↓
Zone 3      Zone 2     Zone 5     Zone 4
```

## 🎯 Usage

1. Open `index.html` in a web browser
2. Add delivery orders by selecting a restaurant and destination zone
3. View assigned agents and shortest delivery routes
4. Track distances and agent assignments in real-time

## 📝 License

MIT License