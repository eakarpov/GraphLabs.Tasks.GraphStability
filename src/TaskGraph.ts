import {Vertex, Edge, Graph } from 'graphlabs.core.graphs';

export class TaskGraph {

  /**
   * Get subgraph of graph
   * input: vertives
   */
   public static getSubgraph(subVertices: Vertex[], graph: Graph<Vertex,Edge>): Graph<Vertex, Edge>{
     console.log("subGraph input", subVertices, graph);
      const subGraph = new Graph<Vertex, Edge>();
      console.log("taskgraph 13")
      if (typeof subVertices !== "undefined") {
        subVertices.forEach(v => {
            subGraph.addVertex(v);
        });
        console.log("taskgraph 18")
        graph.edges.filter(e =>
                (subVertices.map(v => v.name).includes(e.vertexOne.name))
                &&  (subVertices.map(v => v.name).includes(e.vertexTwo.name))).forEach((e: Edge) => subGraph.addEdge(new Edge(e.vertexOne, e.vertexTwo)));
        //console.log("subgraph", subGraph);
    }
      return subGraph;
  }

  /**
   * Get neighbourhood
   */
  public static getNeighbourhood(vertex: Vertex, graph: Graph<Vertex,Edge>): Vertex[] {
    /*return graph.vertices.reduce((accum: Vertex[], next: Vertex) => {
            graph.edges.forEach(e => {
              if (e.vertexOne === vertex) accum.push(e.vertexTwo as Vertex);
              if (e.vertexTwo === vertex) accum.push(e.vertexOne as Vertex);
            });
            return accum;
          }, []);*/
        //  public static getNeighbourhood(vertex: Vertex, graph: Graph<Vertex,Edge>): Vertex[] {
      console.log("hello");
      /*const set = graph.edges.reduce((accum: Set<string>, next: Edge) => {
        if (<Vertex>next.vertexOne == vertex) {
          accum.add(next.vertexTwo.name);
          console.log("im here");
        }
        if (<Vertex>next.vertexTwo == vertex) {
          accum.add(next.vertexOne.name);
          console.log("im here");
        }
        return accum;
      }, new Set<string>());
      return graph.vertices.reduce((vertices: Vertex[], n: Vertex) => {
        if (n.name in set) {
          vertices.push(vertex);
        }
        return vertices;
      }, [])*/
      let answer: Vertex[] = [];
      const answerNames: string[] = [];
      //answerNames.push("hello");
      if (graph.edges.length > 0) {
        console.log("taskgraph 61")
        graph.edges.forEach(e => {
          if (e.vertexOne.name === vertex.name) {
            answerNames.push(e.vertexTwo.name)
          }
          if (e.vertexTwo.name === vertex.name) {
            answerNames.push(e.vertexOne.name)
          }
        })
    }
      answer = graph.vertices.filter(v =>
        answerNames.includes(v.name))
      return answer;
  }

  /**
   * Get non-neighbourhood
   */
  public static getNonNeighbourhood(vertex: Vertex, graph: Graph<Vertex,Edge>): Vertex[] {
      console.log("nonn input", vertex, graph);
      /*vertex = (!!vertex.name) ? vertex: {name: <any>vertex as string} as Vertex;
      const neighbours = TaskGraph.getNeighbourhood(vertex , graph);*/
      const neighbours :Vertex[] = TaskGraph.getNeighbourhood(vertex, graph);
      console.log("neigb",neighbours);
      neighbours.push(vertex);
      console.log("neigb",neighbours);
      /*const answer = graph.vertices.reduce((accum: Vertex[], next: Vertex) => {
          const n: Vertex = (!!next.name) ? next: {name: <any>vertex as string} as Vertex;
          return (neighbours.indexOf(<any>n.name as Vertex) >= 0) ?
              accum : accum.concat(<any>n.name as Vertex)}, [])*/
      const answer = graph.vertices.filter(v => !neighbours.map(n => n.name).includes(v.name))
      console.log(answer);
      console.log("nonn end", vertex, graph);
      return answer
  }

  /**
   * Get vertex's degree
   */
  public static getVertexDegree(vertex: Vertex, graph: Graph<Vertex,Edge>): number {
    return graph.edges.filter((e: Edge) => (e.vertexOne === vertex) || (e.vertexTwo === vertex)).length;
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
