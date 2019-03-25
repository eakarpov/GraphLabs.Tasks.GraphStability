import './tree.css';
import {createGraph} from './graph';
import {IEdge, IVertex, IGraph} from "graphlabs.core.graphs";

import * as d3 from 'd3';
import TreeNode from './TreeNode';

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
    private graph: IGraph<IVertex, IEdge> = createGraph();
    private treeNode = TreeNode.getInstance({
        label: 'G',
        graph: this.graph,
        calculatedWeight: this.graph.vertices.map((e: IVertex) => e.name),
        inputWeight: this.graph.vertices.map((e: IVertex) => e.name),
        hasVertexError: false,
        hasWeightError: false,
        position: {x: this.svg.tree.cx, y: this.svg.tree.cy},
        children: [],
    });
    private activeId?: number = void 0;

    constructor() {
        this.initialize();
    }

    public getEdges() {
        const e: any[] = [];
        const getEdges = (node: TreeNode) => {
            node.children.forEach((c: TreeNode) => {
                e.push({
                    v1: node.getId(),
                    l1: node.getLabel(),
                    p1: node.getPosition(),
                    v2: c.getId(),
                    l2: c.getLabel(),
                    p2: c.getPosition()
                });
            });
            node.children.forEach(getEdges);
        };

        getEdges(this.treeNode);
        return e.sort((a, b) => a.v2 - b.v2);
    }

    public changeActive(id: number) {
        this.activeId = id;
        this.redraw();
    }

    public removeLeaf() {
        if (this.activeId === void 0) { return; }
        if (this.activeId === 0) { return; }
        this.treeNode.removeLeaf(this.activeId);
        this.activeId = void 0;
        this.rePosition();
        this.redraw();
    }

    public addLeaf() {
        // проверка, выбрана ли вершина
        if (this.activeId === void 0) {
            alert("Выберите вершину дерева, для которой надо добавить потомка");
            return;
        }
        const vertexName = prompt("Введите имя вершины") || '';
        const vertexArray = prompt("Введите множество вершин (числа через пробел") || '';
        // проверяем введенную сроку на соответствующий формат
        if (!(/^[0-9]+(\s+[0-9]+)*$/.test(vertexArray) || /^\s*$/.test(vertexArray))) {
            alert("Пожалуйста, укажите множество вершин через пробел");
            return;
        }
        this.treeNode.addLeaf(this.activeId, vertexName, vertexArray.split(/\s+/));
        this.rePosition();
        this.redraw();
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

        const circles = d3.select("#g_circles").selectAll('circle').data(this.treeNode.getNodeList());

        const temp1 = circles.enter().append('circle')
            .attr('cx', d => {
                const parent = this.treeNode.deepNodeSearch((e: TreeNode) => e.children.some((t: TreeNode) => t.getId() === d.getId()));
                if (parent) {
                    return parent.getPosition().x
                } else {
                    return d.getPosition().x
                }
            })
            .attr('cy', d => {
                const parent = this.treeNode.deepNodeSearch((e: TreeNode) => e.children.some((t: TreeNode) => t.getId() === d.getId()));
                if (parent) {
                    return parent.getPosition().y
                } else {
                    return d.getPosition().y
                }
            })
            .attr('r', this.svg.defaultVertexRadius)
            .on('click', (d) => {
                return this.changeActive(d.getId());
            })
        temp1.append('title').text((d) => d.inputWeight.join(', '));
        temp1.transition().duration(500)
            .attr('cx', d => d.getPosition().x)
            .attr('cy', d => d.getPosition().y)
            .attr('class', (d) => {
                return d.hasVertexError ? (d.getId() === this.activeId ? 'activeError' : 'error') : (d.getId() === this.activeId ? 'active' : "")
            });

        circles.transition().duration(500)
            .attr('cx', d => d.getPosition().x)
            .attr('cy', d => d.getPosition().y)
            .attr('class', (d) => {
                return d.hasVertexError ? (d.getId() === this.activeId ? 'activeError' : 'error') : (d.getId() === this.activeId ? 'active' : "")
            });

        circles.exit().remove();

        const labels = d3.select("#g_labels").selectAll('text').data(this.treeNode.getNodeList());

        labels.text(d => d.getLabel()).transition().duration(500)
            .attr('x', d => d.getPosition().x)
            .attr('y', d => d.getPosition().y + 5);
        labels.append('title').text((d) => d.inputWeight.join(', '));

        const temp2 = labels.enter().append('text')
            .attr('x', (d) => {
                const parent = this.treeNode.deepNodeSearch((e: TreeNode) => e.children.some((t: TreeNode) => t.getId() === d.getId()));
                if (parent) {
                    return parent.getPosition().x
                } else {
                    return d.getPosition().x
                }
            })
            .attr('y', (d) => {
                const parent = this.treeNode.deepNodeSearch((e: TreeNode) => e.children.some((t: TreeNode) => t.getId() === d.getId()));
                if (parent) {
                    return parent.getPosition().y + 5
                } else {
                    return d.getPosition().y + 5
                }
            })
            .text((d) => d.getLabel())
            .on('click', (d) => this.changeActive(d.getId()));
        temp2.transition().duration(500)
            .attr('x', d => d.getPosition().x)
            .attr('y', d => d.getPosition().y + 5);
        temp2.append('title').text((d) => d.inputWeight.join(', '));

        labels.exit().remove();
    }

    private getLeafCount(node: TreeNode): number {
        if (node.children.length === 0) { return 1; }
        return node.children.map((e: TreeNode) => this.getLeafCount(e)).reduce((a, b) => a + b);
    }

    private rePosition(node:TreeNode = this.treeNode) {
        const lC = this.getLeafCount(node);
        let left = node.getPosition().x - this.svg.tree.w * (lC - 1) / 2;
        node.children.forEach((d) => {
            const w = this.svg.tree.w * this.getLeafCount(d);
            left += w;
            d.setPosition({x: left - (w + this.svg.tree.w) / 2, y: node.getPosition().y + this.svg.tree.h});
            this.rePosition(d);
        });
    }

    private initialize() {

        d3.select("#my-canvas").append("div").attr('id', 'navdiv');

        d3.select("#navdiv").append("button").attr('type', 'button').text('+')
            .on('click',  () => {
                this.addLeaf();
            });

        d3.select("#navdiv").append("button").attr('type', 'button').text('-')
            .on('click', () => {
                if (this.activeId === void 0) { return; }
                this.removeLeaf();
            });

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
            .data(this.treeNode.getNodeList())
            .enter()
            .append('circle')
            .attr('cx', d => d.getPosition().x)
            .attr('cy', d => d.getPosition().y)
            .attr('r', this.svg.defaultVertexRadius)
            .on('click', (d) => {
                return this.changeActive(d.getId());
            })
            .append('title').text((d) => d.inputWeight.join(', '));

        d3.select("#treesvg")
            .append('g')
            .attr('id', 'g_labels')
            .selectAll('text')
            .data(this.treeNode.getNodeList())
            .enter()
            .append('text')
            .attr('x', d => d.getPosition().x)
            .attr('y', d => d.getPosition().y + 5)
            .text(d => d.getLabel())
            .on('click', (d) => {
                return this.changeActive(d.getId());
            })
            .append('title').text((d) => d.inputWeight.join(', '));
    }

}
