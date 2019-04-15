import {store} from "graphlabs.core.template";
import {IEdge, IVertex, IGraph, Vertex, Edge, Graph} from "graphlabs.core.graphs";

export function createGraph() {
    console.log("createGraph (TaskGraph.js): грузим граф из задания для дальнейшего использования");
    const taskGraph: IGraph<IVertex, IEdge> = Graph.createEmpty(0);
    store.getState().graph.vertices.forEach((e: IVertex) => taskGraph.addVertex(new Vertex(e.name)));
    store.getState().graph.edges.forEach((e: IEdge) => {
        const v1 = taskGraph.vertices.find((v2: IVertex) => v2.name == e.vertexOne.name);
        const v2 = taskGraph.vertices.find((v2: IVertex) => v2.name == e.vertexTwo.name);
        if (v1 && v2) {
            taskGraph.addEdge(new Edge(v1, v2));
        }
    });
    return taskGraph
}

export function getNeighbours(vertex: Vertex, graph: Graph<Vertex, Edge>): string[] {
    console.log("getNeighbours (TaskGraph.js): ищем соседей вершины графа");
    const answer = graph.edges
        .reduce((accum: Vertex[], next: Edge) =>
            (next.vertexOne == vertex)
                ? accum.concat(next.vertexTwo as Vertex)
                : (next.vertexTwo == vertex)
                ? accum.concat(next.vertexOne as Vertex)
                : accum, [])
        .map((e: Vertex) => e.name);
    return answer
}

export function getNonNeighbours(vertex: Vertex, graph: Graph<Vertex, Edge>) {
    console.log("getNoNNeighbours (TaskGraph.js): ищем не-соседей вершины графа");
    const neighbours = getNeighbours(vertex, graph);
    neighbours.push(vertex.name);
    console.log(neighbours);
    const answer = graph.vertices.reduce((accum: string[], next: Vertex) =>
        (neighbours.includes(next.name)) ?
        accum : accum.concat(next.name), []);
    console.log('вершина ' + vertex + 'неокрестность ' + answer);
    return answer
}

export function getSubgraph(subVertices: string[] = [], graph: Graph<Vertex, Edge>) {
    console.log("getSubgraph (TaskGraph.js): строим подграф графа");
    const subGraph = Graph.createEmpty(0);
    graph.vertices.filter(v => subVertices.includes(v.name)).forEach(v => subGraph.addVertex(v));
    graph.edges.filter(e => subVertices.includes(e.vertexOne.toString())
        && subVertices.includes(e.vertexTwo.toString()))
        .forEach(e => subGraph.addEdge(e));
    return subGraph;
}
