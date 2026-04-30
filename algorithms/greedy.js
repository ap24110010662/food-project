// ============================================================
//  Greedy Algorithm — Nearest Delivery Agent Assignment
//  Strategy : For each new order, assign it to the delivery
//             agent who is currently closest to the restaurant
//             (greedy local optimum at each step).
//  Input  : orders   — array of { id, restaurant, destination }
//           agents   — array of { id, currentLocation }
//           distances — precomputed shortest distances (from Dijkstra)
//  Output : assignments — array of { orderId, agentId, path }
// ============================================================

function greedyAssign(orders, agents, allDistances) {
  // Deep-copy agent positions so we can update them as orders are assigned
  const agentState = agents.map(a => ({ ...a }));
  const assignments = [];

  for (const order of orders) {
    let bestAgent = null;
    let bestDist = Infinity;

    // Find the agent nearest to the restaurant
    for (const agent of agentState) {
      const distToRestaurant =
        allDistances[agent.currentLocation]?.[order.restaurant] ?? Infinity;

      if (distToRestaurant < bestDist) {
        bestDist = distToRestaurant;
        bestAgent = agent;
      }
    }

    if (bestAgent) {
      assignments.push({
        orderId: order.id,
        agentId: bestAgent.id,
        restaurant: order.restaurant,
        destination: order.destination,
        distToRestaurant: bestDist,
      });

      // Greedy update: agent moves to delivery destination after the order
      bestAgent.currentLocation = order.destination;
    }
  }

  return assignments;
}

export { greedyAssign };