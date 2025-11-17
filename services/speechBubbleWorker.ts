import { forceSimulation, forceCollide, forceManyBody } from 'd3-force';

// These types must be defined within the worker scope as it doesn't share the main app's type context.
interface PanelDataForWorker {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SimulationNode {
  id: string;
  panel: PanelDataForWorker;
  index?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

self.onmessage = (event: MessageEvent<{ panelsWithDialogue: PanelDataForWorker[] }>) => {
  const { panelsWithDialogue } = event.data;

  if (!panelsWithDialogue || panelsWithDialogue.length === 0) {
    self.postMessage({});
    return;
  }

  // Initialize nodes for the simulation
  const nodes: SimulationNode[] = panelsWithDialogue.map((panel) => ({
    id: panel.id,
    panel: panel,
    // Start the bubble near the top-center of its panel
    x: panel.x + panel.width / 2,
    y: panel.y + 50,
  }));

  // Create the simulation
  const simulation = forceSimulation(nodes)
    .force('collide', forceCollide().radius(60).strength(0.8))
    .force('repel', forceManyBody().strength(-200))
    .stop(); // Stop the simulation from running on a timer

  // Run the simulation to completion synchronously.
  // The number of ticks is calculated based on the default alpha decay.
  const n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()));
  
  for (let i = 0; i < n; ++i) {
    simulation.tick();

    // After each tick, apply boundary constraints to keep bubbles within their panels.
    nodes.forEach((node) => {
      const panel = node.panel;
      const radius = 30; // An approximate radius for the speech bubble
      
      if (node.x !== undefined) {
          node.x = Math.max(
              panel.x + radius,
              Math.min(panel.x + panel.width - radius, node.x)
          );
      }
      if (node.y !== undefined) {
          node.y = Math.max(
              panel.y + radius,
              Math.min(panel.y + panel.height - radius - 20, node.y) // -20 to keep it from the very bottom
          );
      }
    });
  }

  // Once the simulation is complete, format the final positions.
  const finalPositions: Record<string, { x: number; y: number }> = {};
  nodes.forEach((node) => {
    finalPositions[node.id] = {
      // Positions are relative to the top-left of the panel for CSS positioning
      x: node.x! - node.panel.x,
      y: node.y! - node.panel.y,
    };
  });

  // Send the calculated positions back to the main thread.
  self.postMessage(finalPositions);
};
