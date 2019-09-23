import './tree.css';
import { store } from 'graphlabs.core.template';
import {Edge, Vertex, Graph} from "graphlabs.core.graphs";
import {TreeNode} from './TreeNode';
import {TaskGraph} from './TaskGraph';

import * as d3 from 'd3';

class StabilityTreeNode extends TreeNode<{
      parentId: number, graph: Graph<Vertex,Edge>, realWeight: Vertex[], inputWeight: Vertex[],
      hasVertexError: boolean, hasWeightError: boolean, position: {x: number, y: number}
    }> {

      public children: StabilityTreeNode[] = [];
};

export default class Tree {
    private svg: any = {
        svgWidth: 100,
        svgHeight: 100,
        defaultVertexRadius: 12,
        tree: {
            cx: 300,
            cy: 30,
            w: 40,
            h: 70
        }
    };

    public graph: Graph<Vertex, Edge> = store.getState().graph;

    public lastId: number = 0;

    private activeId?: number = void 0;

    public tree: StabilityTreeNode = new StabilityTreeNode(
        'G',
        {parentId: this.lastId,
        graph: this.graph,
        realWeight: this.graph.vertices,
        inputWeight: this.graph.vertices,
        hasVertexError: false,
        hasWeightError: false,
        position: {x: this.svg.tree.cx, y: this.svg.tree.cy}
    });

    constructor() {
        this.initialize();
    }

    public getEdges() {
        const e: any[] = [];
        const getEdges = (node: StabilityTreeNode) => {
          if (node.children.length > 0) {
            node.children.forEach((c: StabilityTreeNode) => {
                e.push({
                    v1: node.getId(),
                    l1: node.getLabel(),
                    p1: node.weight.position,
                    v2: c.getId(),
                    l2: c.getLabel(),
                    p2: c.weight.position
                });
            });
            console.log("tree 78")
            node.children.forEach(getEdges);
          }
        };

        getEdges(this.tree);
        return e.sort((a, b) => a.v2 - b.v2);
    }

    public changeActive(id: number) {
        this.activeId = id;
        this.redraw();
    }

    public removeNode() {
        if (this.activeId === void 0 || this.activeId === 0) {
            alert("Выберите вершину для удаления");
            return;
        }
        if (this.activeId === 1) {
            alert("Нельзя удалить корень дерева");
            return;
        }
        if (confirm("Вы действительно хотите удалить выбранную вершину?")) {
            this.tree.removeNode(this.activeId);
            this.activeId = void 0;
            this.rePosition();
            this.redraw();
        }
        else {return;}
    }

    public addChild() {
        // проверка, выбрана ли вершина
        if (this.activeId === void 0) {
            alert("Выберите вершину дерева, для которой надо добавить потомка");
            return;
        }
        else {
          const vertexName = prompt("Введите имя вершины") || '';
          const vertexArray = prompt("Введите множество вершин (числа через пробел") || '';
          // проверяем введенную сроку на соответствующий формат
          if (!(/^[0-9]+(\s+[0-9]+)*$/.test(vertexArray) || /^\s*$/.test(vertexArray))) {
              alert("Пожалуйста, укажите множество вершин через пробел");
              return;
          }
          const vertexNames = vertexArray.split(' ');
          const vertexError = this.checkVertex(this.tree.getNodeById(this.activeId), vertexName);
          const vertice = this.graph.vertices.find(v => v.name === vertexName);
          if (vertice) {
              this.tree.addChild(
                  this.activeId,
                  vertexName,
                  {
                      parentId: this.activeId,
                      graph: TaskGraph.getSubgraph(this.graph.vertices.filter(v => vertexNames.includes(v.name)),
                          this.tree.getNodeById(this.activeId).weight.graph),
                      realWeight: TaskGraph.getNeighbourhood(vertice,
                          this.tree.getNodeById(this.activeId).weight.graph),
                      inputWeight: this.graph.vertices.filter(v => vertexNames.includes(v.name)),
                      hasVertexError: vertexError,
                      hasWeightError: this.checkWeigth(vertexError,
                          TaskGraph.getNeighbourhood(vertice,
                              this.tree.getNodeById(this.activeId).weight.graph),
                          this.graph.vertices.filter(v => vertexNames.includes(v.name))),
                      position: {x: this.svg.tree.cx, y: this.svg.tree.cy}
                  }
              );
              this.rePosition();
              this.redraw();
          }
      }
    };

    public checkVertex(parent: StabilityTreeNode, vertexName: string) {
        if (this.activeId) {
            // проверка, есть ли введенная вершина в графе
            if (this.tree.weight.graph.vertices.map(e => e.name).includes(vertexName)) {
                // проверка, есть ли введенная вершина в графе, соответствующем узлу-родителю
                if (parent.weight.graph.vertices.map(e => e.name).includes(vertexName)) {
                    // проверка, есть ли у вершины родителя еще потомки
                    if (this.tree.getNodeById(this.activeId).children.length === 0) {
                        return false
                    }
                    else {
                        // проверка, дублирует ли введенная вершина одну из вершин своего уровня
                        if (!parent.children.map(e => e.label).includes(vertexName)) {
                            // проверка, входит ли добавляемая вершина в окрестность первого узла потомка
                            const firstChild = this.tree.getNodeById(Math.min(...parent.children.map(e => e.getId())));
                            const vertice = this.graph.vertices.find(v => v.name === firstChild.label);
                            if (!vertice) { throw new Error("fhfghdsfdfghdfhf"); }
                            if (TaskGraph.getNeighbourhood(vertice, parent.weight.graph).map(v => v.name).includes(vertexName)) {
                                return false
                            }
                            else {
                                store.dispatch({
                                    type: "@@notifier/add_action",
                                    payload: {
                                        fee: 5,
                                        datetime: new Date(),
                                        message: "Введенная вершина не входит в окрестность первого потомка выбранной вершины"
                                    }
                                })
                                return true;
                            }
                        }
                        else {
                            store.dispatch({
                                type: "@@notifier/add_action",
                                payload: {
                                    fee: 5,
                                    datetime: new Date(),
                                    message: "У выбранной вершины уже есть потомок с этим именем"
                                }
                            })
                            return true;
                        }
                    }
                }
                else {
                    store.dispatch({
                        type: "@@notifier/add_action",
                        payload: {
                            fee: 5,
                            datetime: new Date(),
                            message: "Вершины с данным именем нет в графе, соответствующем узлу-родителю"
                        }
                    })
                    return true;
                }
            }
            else {
                store.dispatch({
                    type: "@@notifier/add_action",
                    payload: {
                        fee: 5,
                        datetime: new Date(),
                        message: "Вершины с данным именем нет в исходом графе"
                    }
                })
                return true;
            }
          }
          else { return false; }
        }

    public checkWeigth(error: boolean, real: Vertex[], input: Vertex[]) {
            if (error) {
                {
                    store.dispatch({
                        type: "@@notifier/add_action",
                        payload: {
                            fee: 0,
                            datetime: new Date(),
                            message: "Так как была введена ошибочная вершина, ее вес так же считается ошибочным"
                        }
                    })
                    return true;
                }
            }
            else {
                // проверяем, что введенное множество вершин соответствует рассчитанной неокрестности вершины
                // если несоответствие, то записываем ошибку
                if (real.sort().toString() === input.sort().toString()) {
                    return false
                }
                else {
                    store.dispatch({
                        type: "@@notifier/add_action",
                        payload: {
                            fee: 0,
                            datetime: new Date(),
                            message: "Введеное множество вершин неверно"
                        }
                    })
                    return true;
                }
            }
        }

    private redraw() {
        const edges = d3.select("#g_lines").selectAll('line').data(this.getEdges());

        edges.transition().duration(500)
            .attr('x1', d => d.p1.x)
            .attr('y1', d => d.p1.y)
            .attr('x2', d => d.p2.x)
            .attr('y2', d => d.p2.y);

        edges.enter().append('line')
            .attr('x1', d => d.p1.x)
            .attr('y1', d => d.p1.y)
            .attr('x2', d => d.p1.x)
            .attr('y2', d => d.p1.y)
            .transition().duration(500)
            .attr('x2', d => d.p2.x)
            .attr('y2', d => d.p2.y);

        edges.exit().remove();

        const circles = d3.select("#g_circles").selectAll('circle').data(this.tree.getNodeList());

        const temp1 = circles.enter().append('circle')
            .attr('cx', d => {
                const parent = this.tree.deepNodeSearch((e: StabilityTreeNode) => e.children.some((t: StabilityTreeNode) => t.getId() === d.getId()));
                if (parent) {
                    return parent.weight.position.x
                } else {
                    return d.weight.position.x
                }
            })
            .attr('cy', d => {
                const parent = this.tree.deepNodeSearch((e: StabilityTreeNode) => e.children.some((t: StabilityTreeNode) => t.getId() === d.getId()));
                if (parent) {
                    return parent.weight.position.y
                } else {
                    return d.weight.position.y
                }
            })
            .attr('r', this.svg.defaultVertexRadius)
            .on('click', (d) => {
                return this.changeActive(d.getId());
            })
        temp1.append('title').text((d) => d.weight.inputWeight.map(v => v.name).join(', '));
        temp1.transition().duration(500)
            .attr('cx', d => d.weight.position.x)
            .attr('cy', d => d.weight.position.y)
            .attr('class', (d) => {
                return d.weight.hasVertexError ? (d.getId() === this.activeId ? 'activeError' : 'error') : (d.getId() === this.activeId ? 'active' : "")
            });

        circles.transition().duration(500)
            .attr('cx', d => d.weight.position.x)
            .attr('cy', d => d.weight.position.y)
            .attr('class', (d) => {
                return d.weight.hasVertexError ? (d.getId() === this.activeId ? 'activeError' : 'error') : (d.getId() === this.activeId ? 'active' : "")
            });

        circles.exit().remove();

        const labels = d3.select("#g_labels").selectAll('text').data(this.tree.getNodeList());

        labels.text(d => d.getLabel()).transition().duration(500)
            .attr('x', d => d.weight.position.x)
            .attr('y', d => d.weight.position.y + 5);
        labels.append('title').text((d) => d.weight.inputWeight.map(v => v.name).join(', '));

        const temp2 = labels.enter().append('text')
            .attr('x', (d) => {
                const parent = this.tree.deepNodeSearch((e: StabilityTreeNode) => e.children.some((t: StabilityTreeNode) => t.getId() === d.getId()));
                if (parent) {
                    return parent.weight.position.x
                } else {
                    return d.weight.position.x
                }
            })
            .attr('y', (d) => {
                const parent = this.tree.deepNodeSearch((e: StabilityTreeNode) => e.children.some((t: StabilityTreeNode) => t.getId() === d.getId()));
                if (parent) {
                    return parent.weight.position.y + 5
                } else {
                    return d.weight.position.y + 5
                }
            })
            .text((d) => d.getLabel())
            .on('click', (d) => this.changeActive(d.getId()));
        temp2.transition().duration(500)
            .attr('x', d => d.weight.position.x)
            .attr('y', d => d.weight.position.y + 5);
        temp2.append('title').text((d) => d.weight.inputWeight.map(v => v.name).join(', '));

        labels.exit().remove();
    }

    private getLeafCount(node: StabilityTreeNode): number {
        if (node.children.length === 0) { return 1; }
        return node.children.map((e: StabilityTreeNode) => this.getLeafCount(e)).reduce((a, b) => a + b);
    }

    private rePosition(node:StabilityTreeNode = this.tree) {
        const lC = this.getLeafCount(node);
        let left = node.weight.position.x - this.svg.tree.w * (lC - 1) / 2;
        if (node.children.length > 0) {
          console.log("tree 345")
          node.children.forEach((d) => {
              const w = this.svg.tree.w * this.getLeafCount(d);
              left += w;
              d.weight.position.x = left - (w + this.svg.tree.w) / 2;
              d.weight.position.y = node.weight.position.y + this.svg.tree.h;
              this.rePosition(d);
          });
      }
    }

    private initialize() {

        d3.select("#my-canvas").append("div").attr('id', 'navdiv');

        d3.select("#my-canvas")
            .append("svg")
            .attr("width", this.svg.svgWidth + "%")
            .attr("height", this.svg.svgHeight + "%")
            .attr('id', 'treesvg')
            .attr('viewBox', "0 0 600 600");

        d3.select("#treesvg")
            .append('g')
            .attr('id', 'g_lines')
            .selectAll('line')
            .data(this.getEdges())
            .enter()
            .append('line')
            .attr('x1', d => d.p1.x)
            .attr('y1', d => d.p1.y)
            .attr('x2', d => d.p2.x)
            .attr('y2', d => d.p2.y);

        d3.select("#treesvg")
            .append('g')
            .attr('id', 'g_circles')
            .selectAll('circle')
            .data(this.tree.getNodeList())
            .enter()
            .append('circle')
            .attr('cx', d => d.weight.position.x)
            .attr('cy', d => d.weight.position.y)
            .attr('r', this.svg.defaultVertexRadius)
            .on('click', (d) => {
                return this.changeActive(d.getId());
            })
            .append('title').text((d) => d.weight.inputWeight.map(v => v.name).join(', '));

        d3.select("#treesvg")
            .append('g')
            .attr('id', 'g_labels')
            .selectAll('text')
            .data(this.tree.getNodeList())
            .enter()
            .append('text')
            .attr('x', d => d.weight.position.x)
            .attr('y', d => d.weight.position.y + 5)
            .text(d => d.getLabel())
            .on('click', (d) => {
                return this.changeActive(d.getId());
            })
            .append('title').text((d) => d.weight.inputWeight.map(v => v.name).join(', '));
    }

}
