import {Vertex, Edge, Graph } from 'graphlabs.core.graphs';

export class TaskGraph {

  /**
   * Get subgraph of graph
   * input: vertices
   */
  public static getSubgraph(subVertices: Vertex[], graph: Graph<Vertex,Edge>): Graph<Vertex, Edge>
  {
      const subGraph = new Graph<Vertex, Edge>();
      if (typeof subVertices !== "undefined") {
          subVertices.forEach(v => {
            subGraph.addVertex(v);
          });
          graph.edges.filter(e =>
            (subVertices.map(v => v.name).indexOf(e.vertexOne.toString()) !== -1)
            &&  (subVertices.map(v => v.name).indexOf(e.vertexTwo.toString())) !== -1)
            .forEach((e: Edge) => subGraph.addEdge(new Edge(e.vertexOne, e.vertexTwo)));
      }
      return subGraph;
  }

  /**
   * Get neighbourhood
   */
  public static getNeighbourhood(vertex: Vertex, graph: Graph<Vertex,Edge>): Vertex[] {
      let answerNames: string[] = [];
      if (graph.edges.length > 0) {
        graph.edges.forEach(e => {
          if (e.vertexOne.toString() === vertex.name) {
            answerNames.push(e.vertexTwo.toString())
          }
          if (e.vertexTwo.toString() === vertex.name) {
            answerNames.push(e.vertexOne.toString())
          }
        })
      }
      return graph.vertices.filter(v => answerNames.includes(v.name))
  }

  /**
   * Get non-neighbourhood
   */
  public static getNonNeighbourhood(vertex: Vertex, graph: Graph<Vertex,Edge>): Vertex[] {
      const neighbours : Vertex[] = TaskGraph.getNeighbourhood(vertex, graph);
      neighbours.push(vertex);
      return graph.vertices.filter(v => !neighbours.map(n => n.name).includes(v.name))
  }

  /**
   * Get vertex's degree
   */
  public static getVertexDegree(vertex: Vertex, graph: Graph<Vertex,Edge>): number {
    return graph.edges.filter((e: Edge) => (e.vertexOne.toString() === vertex.name)
        || (e.vertexTwo.toString() === vertex.name)).length;
  }

  /**
   * Get vertex with minimum degree
   */
   public static getVertexWithMinDegree(graph: Graph<Vertex,Edge>): Vertex | null {
     return graph.vertices.reduce((min: Vertex | null, next: Vertex) => {
       if (!min || TaskGraph.getVertexDegree(next, graph) < TaskGraph.getVertexDegree(min, graph)) { return next };
       return min;
     }, null);
   }
}
