import {TreeNode} from './TreeNode'
import {Graph} from 'graphlabs.core.graphs'
import {Vertex} from 'graphlabs.core.graphs'
import {Edge} from 'graphlabs.core.graphs'
import {TaskGraph} from './TaskGraph'

export class TreeStabilityBuilder {
  public static graphToTreeNode(taskGraph: Graph<Vertex, Edge>): string[][] {
    const treeNode = new TreeNode<{nonneighbourhood: Vertex[], graph: Graph<Vertex, Edge>}>("G", {
      nonneighbourhood: [],
      graph: taskGraph
    });
    const rootNodeId = TreeNode.lastId;
    const queue: number[] = [];
    queue.push(rootNodeId);
    const answers: string[][] = [];
    while (queue.length > 0) {
      const parentNode = treeNode.getNodeById(queue.shift() as number);
      console.log(parentNode);
      const childrenNodes = TaskGraph.getNeighbourhood(TaskGraph.getVertexWithMinDegree(parentNode.weight.graph) as Vertex, parentNode.weight.graph).concat(TaskGraph.getVertexWithMinDegree(parentNode.weight.graph) as Vertex);
      childrenNodes.forEach(node => {
        console.log(TaskGraph.getNonNeighbourhood(node, parentNode.weight.graph)[0])
        treeNode.addChild(parentNode.id, node.name, {
          nonneighbourhood: TaskGraph.getNonNeighbourhood(node, parentNode.weight.graph),
          graph: <Graph<Vertex, Edge>>TaskGraph.getSubgraph(TaskGraph.getNonNeighbourhood(node, parentNode.weight.graph), parentNode.weight.graph)
        })
        const newGraph = treeNode.getNodeById(TreeNode.lastId).weight.graph;

        console.log("newGraph", newGraph);
        if (newGraph.vertices.length == 0) {
          const answer: string[] = [];
          let id: number | undefined = TreeNode.lastId;
          while (!!id && id !== rootNodeId) {
            const n = treeNode.getNodeById(id as number);
            answer.push(n.label);
            id = n.parentId;
          }
          //console.log("answer", answer);
          answers.push(answer);
          //console.log("hello");
        } else {
          //console.log("lastId", TreeNode.lastId);
          queue.push(TreeNode.lastId);
        }
      })
    }
    return TreeStabilityBuilder.cleanAnswer(answers);
  }

  private static cleanAnswer(answers: string[][]): string[][] {
    const newAnswer: string[][] = [];
    answers.forEach(a => {
      if (newAnswer.some(e => TreeStabilityBuilder.arrayIsEqual(e, a))) return;
      newAnswer.push(a);
    });
    return newAnswer;
  }

  private static arrayIsEqual(array1: string[], array2: string[]): boolean {
    if (array1.length !== array2.length) return false;
    return array1.every(e1 => array2.some(e2 => e1 === e2));
  }
}
