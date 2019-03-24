import {store} from "graphlabs.core.template";
import {IEdge, IVertex, IGraph, Vertex, Edge, Graph} from "graphlabs.core.graphs";

export function createGraph() {
    const taskGraph: IGraph<IVertex, IEdge> = Graph.createEmpty(0);
    store.getState().graph.vertices.forEach((e: IVertex) => taskGraph.addVertex(new Vertex(e.name)));
    store.getState().graph.edges.forEach((e: IEdge) => {
        const v1 = taskGraph.vertices.find((v: IVertex) => v.name === e.vertexOne.name);
        const v2 = taskGraph.vertices.find((v: IVertex) => v.name === e.vertexTwo.name);
        if (v1 && v2) {
            taskGraph.addEdge(new Edge(v1, v2));
        }
    });
    return taskGraph
}

export function getNeighbours(vertex: string, graph: IGraph<IVertex, IEdge>): string[] {
    const answer = graph.edges
        .reduce((accum: IVertex[], next: IEdge) =>
            (next.vertexOne.name === vertex)
                ? accum.concat(next.vertexTwo as Vertex)
                : (next.vertexTwo.name === vertex)
                ? accum.concat(next.vertexOne as Vertex)
                : accum, [])
        .map((e: IVertex) => e.name);
    return answer
}

export function getNonNeighbours(vertex: string, graph: IGraph<IVertex, IEdge>) {
    const neighbours = getNeighbours(vertex, graph);
    neighbours.push(vertex);
    const answer = graph.vertices.reduce((accum: string[], next: IVertex) =>
        (neighbours.includes(next.name)) ?
        accum : accum.concat(next.name), []);
    return answer
}

export function getSubgraph(subVertices: string[], graph: IGraph<IVertex, IEdge>) {
    const subGraph = Graph.createEmpty(0);
    graph.vertices.filter(v => subVertices.includes(v.name)).forEach(v => subGraph.addVertex(v));
    graph.edges.filter(e => subVertices.includes(e.vertexOne.toString())
        && subVertices.includes(e.vertexTwo.toString()))
        .forEach(e => subGraph.addEdge(e));
    return subGraph;
}
