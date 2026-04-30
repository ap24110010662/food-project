// ============================================================
//  Dijkstra's Shortest Path Algorithm
//  Input : graph (adjacency list with weights), startNode
//  Output: { distances, previous } — reconstruct path via previous
// ============================================================

function dijkstra(graph, startNode) {
  const distances = {};   // shortest known distance to each node
  const previous = {};    // previous node on shortest path
  const visited = new Set();

  // Priority queue (min-heap simulation using sorted array)
  let pq = [];

  // Initialise all distances to Infinity
  for (let node in graph) {
    distances[node] = Infinity;
    previous[node] = null;
  }
  distances[startNode] = 0;
  pq.push({ node: startNode, dist: 0 });

  while (pq.length > 0) {
    // Pick node with smallest distance
    pq.sort((a, b) => a.dist - b.dist);
    const { node: current } = pq.shift();

    if (visited.has(current)) continue;
    visited.add(current);

    // Explore neighbours
    for (let neighbour in graph[current]) {
      const weight = graph[current][neighbour];
      const newDist = distances[current] + weight;

      if (newDist < distances[neighbour]) {
        distances[neighbour] = newDist;
        previous[neighbour] = current;
        pq.push({ node: neighbour, dist: newDist });
      }
    }
  }

  return { distances, previous };
}

// Reconstruct path from start → end using 'previous' map
function getPath(previous, endNode) {
  const path = [];
  let current = endNode;
  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }
  return path;
}

export { dijkstra, getPath };