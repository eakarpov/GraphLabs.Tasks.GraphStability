import {getNeighbours, createGraph, getSubgraph, getNonNeighbours} from './graph';
import {IEdge, IVertex, Vertex, IGraph, Edge, Graph} from "graphlabs.core.graphs";
import {store} from "graphlabs.core.template";
import {Notifier} from 'graphlabs.core.notifier';
import * as d3 from 'd3';
import {tree} from "d3";

export const test = 'test';

export default class Tree {
    private svg: any = {
        svgW: 100,
        svgH: 100,
        vRad: 12,
        xRect: 50,
        yRect: 16,
        tree: {
            cx: 300,
            cy: 30,
            w: 40,
            h: 70
        }
    };
    private graph: IGraph<IVertex, IEdge> = createGraph();
    private cx: number = 0;
    private cy: number = 0;
    private currLbl: string = '';
    private vis: any = {
        // идентификатор
        v: 0,
        // имя
        l: 'G',
        // граф, связанный с вершиной
        graph: this.graph,
        // вес узла
        realWeight: this.graph.vertices,
        // вес узла, введенный пользователем
        inputWeight: this.graph.vertices,
        // ошибочная вершина или нет
        vertexError: false,
        // ошибочный вес или нет
        weightError: false,
        p: {x: this.cx, y: this.cy},
        c: []
    };
    private size: number = 1;
    private glabels: any[] = [];
    private active?: number = void 0;

    constructor() {
        this.initialize();
    }

    public findVertex(id?: number) {
        if (this.vis.v === id) {
            return this.vis;
        }
        return this.vis.c.find(this.findVertex);
    }

    public findRectangle() {
        console.log("getVertices (TreeGenerate.js): получаем все вершины дерева");
        const v: any[] = [];
        const getVertices = (t: any, f: { [index: string]: string }) => {
            v.push({
                v: t.v,
                l: t.l,
                p: t.p,
                f: f
            });
            this.vis.c.forEach((d: any) => {
                return getVertices(d, {v: t.v, p: t.p});
            });
        };

        getVertices(this.vis, {});
        return v.sort((a, b) => {
            return a.v - b.v;
        });
    }

    public getEdges() {
        const e: any[] = [];
        console.log("getEdges (TreeGenerate.js): получаем все ребра дерева");
        const getEdges = (nodes: any) => {
            nodes.c.forEach((d: any) => {
                e.push({
                    v1: nodes.v,
                    l1: nodes.l,
                    p1: nodes.p,
                    v2: d.v,
                    l2: d.l,
                    p2: d.p
                });
            });
            nodes.c.forEach(getEdges);
        };

        getEdges(this.vis);
        return e.sort(function (a, b) {
            return a.v2 - b.v2;
        });
    }

    public changeActive(v: number) {
        console.log("changeActive (TreeGenerate.js): меняем активную вершину дерева");
        this.active = v;
        this.redraw();
    }

    public inputAndCheck() {
        // tslint:disable
        console.log("inputAndCheck (TreeGenerate.js): получаем информацию о новой вершине");
        // проверка, выбрана ли вершина
        if (this.active === void 0) {
            alert("Выберите вершину дерева, для которой надо добавить потомка");
            return
        }
        let vertexName = prompt("Введите имя вершины") || '';
        let vertexArray = prompt("Введите множество вершин (числа через пробел") || '';
        // проверяем введенную сроку на соответствующий формат
        if (!(/^[0-9]+(\s+[0-9]+)*$/.test(vertexArray) || /^\s*$/.test(vertexArray))) {
            alert("Пожалуйста, укажите множество вершин через пробел");
            return
        }
        this.addLeaf(this.active, vertexName, vertexArray.split(/\s+/));
    }

    // TODO: WHY IS PARAMETER OPTIONAL?
    public removeLeaf(vertex?: any) {
        console.log("removeLeaf (TreeGenerate.js): удаляем вершину из дерева");

        function removeLeaf(t: any) {
            if (t.c.some((e: any) => e.v === vertex)) {
                t.c = t.c.filter((e: any) => e.v !== vertex);
            }
            t.c.forEach(removeLeaf);
        }

        removeLeaf(this.vis);
        this.rePosition(this.vis);
        this.active = void 0;
        this.redraw();
    }

    public checkVertex(parent: any, vertexName: string = '') {
        console.log("checkVertex (TreeGenerate.js): проверка вершины");
        //проверка, есть ли введенная вершина в графе
        if (this.graph.vertices.map((e: IVertex) => e.name).includes(vertexName)) {
            // проверка, есть ли введенная вершина в графе, соответствующем узлу-родителю
            if (parent.graph.vertices.map((e: any) => e.name).includes(vertexName)) {
                // проверка, есть ли у вершины родителя еще потомки
                if (this.findVertex(this.active).c.length == 0) {
                    return false
                }
                else {
                    // проверка, дублирует ли введенная вершина одну из вершин своего уровня
                    if (!parent.c.map((e: any) => e.l).includes(vertexName)) {
                        // проверка, входит ли добавляемая вершина в окрестность первого узла потомка
                        let firstChild = this.findVertex(Math.min(...parent.c.map((e: any) => e.v)));
                        if (getNeighbours(firstChild.l, parent.graph).includes(vertexName)) {
                            return false
                        }
                        else {
                            Notifier.send({
                                fee: 5,
                                datetime: new Date().getTime(),
                                message: "Введенная вершина не входит в окрестность первого потомка выбранной вершины",
                                variantId: 0,
                                isTaskFinished: false,
                            });
                            return true;
                        }
                    }
                    else {
                        Notifier.send({
                            fee: 5,
                            datetime: new Date().getTime(),
                            message: "У выбранной вершины уже есть потомок с этим именем",
                            variantId: 0,
                            isTaskFinished: false,
                        });
                        return true;
                    }
                }
            }
            else {
                Notifier.send({
                    fee: 5,
                    datetime: new Date().getTime(),
                    message: "Вершины с данным именем нет в графе, соответствующем узлу-родителю",
                    variantId: 0,
                    isTaskFinished: false,
                });
                return true;
            }
        }
        else {
            Notifier.send({
                fee: 5,
                datetime: new Date().getTime(),
                message: "Вершины с данным именем нет в исходом графе",
                variantId: 0,
                isTaskFinished: false,
            });
            return true;
        }
    }

    public checkWeigth(error: string, real: string[], input: string[]) {
        console.log("checkWeigth (TreeGenerate.js): проверка веса вершины");
        let store = require('graphlabs.core.template').store;
        if (error) {
            {
                Notifier.send({
                    fee: 0,
                    datetime: new Date().getTime(),
                    message: "Так как была введена ошибочная вершина, ее вес так же считается ошибочным",
                    variantId: 0,
                    isTaskFinished: false,
                });
                return true;
            }
        }
        else {
            // проверяем, что введенное множество вершин соответствует рассчитанной неокрестности вершины
            // если несоответствие, то записываем ошибку
            if (real.sort().toString() == input.sort().toString()) {
                return false
            }
            else {
                Notifier.send({
                    fee: 0,
                    datetime: new Date().getTime(),
                    message: "Введеное множество вершин неверно",
                    variantId: 0,
                    isTaskFinished: false,
                });
                return true;
            }
        }
    }

    // TODO: NO LET IN CONSTANT ASSIGNMENTS!!!!!
    // TODO: NO CONTEXTFUL FUNCTIONS IN D3 CALLBACKS!!
    // TODO: NO SINGLE-LETTER VARIABLE NAMES!!!
    // TODO: TYPES!!! NO "ANY"!!!!!
    // TODO: WHY ARE PARAMETERS OPTIONAL?
    public addLeaf(node?: any, vertexName?: Vertex, vertexArray?: string[]) {
        console.log("addLeaf (TreeGenerate.js): добавляем новую вершину в дерево");

        const addLeaf = (t: any, name: string) => {
            if (t.v == node) {
                let vError = this.checkVertex(t, vertexName);
                t.c.push({
                    v: this.size++,
                    l: vertexName,
                    graph: getSubgraph(vertexArray, t.graph),
                    realWeight: getNonNeighbours(vertexName, t.graph),
                    inputWeight: vertexArray,
                    vertexError: vError,
                    weightError: this.checkWeigth(vError, getNonNeighbours(vertexName, t.graph), vertexArray),
                    p: {},
                    c: []
                });
                return;
            }
            t.c.forEach(e => addLeaf(e, name));
        };

        addLeaf(this.vis, vertexName);
        this.rePosition(this.vis, vertexName);
        this.redraw();
    }

    public gracefulLabels() {
        console.log("gracefulLabels (TreeGenerate.js)");
        this.glabels = [];
        const v = this.getVertices();
        let vlbls: any[] = [];
        let elbls: any[] = [];
        const gracefulLbl = (c) => {
            if (c == this.size) {
                let lbl = {
                    lbl: vlbls.map(function (_) {
                        return _;
                    })
                };
                this.reLabel(lbl);
                let incMatx = tree.incMatx.map(function (_) {
                    return _;
                });
                if ((tree.incMatx[0] & 2) >> 1 == 1 && this.glabels.every(function (d) {
                    return d.incMatx.toString() != incMatx.toString();
                })) {
                    lbl.incMatx = incMatx;
                    this.glabels.push(lbl);
                }
                return;
            }
            d3.range(0, this.size)
                .filter(function (d) {
                    return (vlbls.indexOf(d) == -1) && (elbls.indexOf(Math.abs(vlbls[v[c].f.v] - d)) == -1);
                })
                .forEach(function (d) {
                    vlbls[c] = d;
                    elbls[c] = Math.abs(vlbls[v[c].f.v] - d);
                    gracefulLbl(c + 1);
                    delete vlbls[c];
                    delete elbls[c];
                });
        };
        d3.range(0, this.size).forEach(function (d) {
            vlbls = [d];
            elbls = [];
            gracefulLbl(1);
        });
        this.showLabel(1);
        d3.select("#labelpos").text(this.currLbl + '/' + this.glabels.length);
        d3.select("#labelnav").style('visibility', 'visible');
    }

    public showLabel(i: number) {
        console.log("showLabel (TreeGenerate.js): всплывающая подсказка");
        if (i > this.glabels.length || i < 1) {
            alert('invalid label position');
            return;
        }

        this.reLabel(this.glabels[i - 1]);
        this.redraw();
        tree.currLbl = i;
        d3.select("#labelpos").text(this.currLbl + '/' + this.glabels.length);
    }

    private redraw() {
        console.log("redraw (TreeGenerate.js): перерисовка дерева");

        let edges = d3.select("#g_lines").selectAll('line').data(this.getEdges());

        edges.transition().duration(500)
            .attr('x1', function (d) {
                return d.p1.x;
            }).attr('y1', function (d) {
            return d.p1.y;
        })
            .attr('x2', function (d) {
                return d.p2.x;
            }).attr('y2', function (d) {
            return d.p2.y;
        });

        edges.enter().append('line')
            .attr('x1', function (d) {
                return d.p1.x;
            }).attr('y1', function (d) {
            return d.p1.y;
        })
            .attr('x2', function (d) {
                return d.p1.x;
            }).attr('y2', function (d) {
            return d.p1.y;
        })
            .transition().duration(500)
            .attr('x2', function (d) {
                return d.p2.x;
            }).attr('y2', function (d) {
            return d.p2.y;
        });

        edges.exit().remove();

        let circles = d3.select("#g_circles").selectAll('circle').data(this.getVertices());

        circles.transition().duration(500).attr('cx', function (d) {
            return d.p.x;
        }).attr('cy', function (d) {
            return d.p.y;
        })
            .attr('class', (d) => {
                const v = this.findVertex(d.v);
                return v.vertexError ? (v.v == this.active ? 'activeError' : 'error') : (v.v == this.active ? 'active' : "")
            });
        circles.append('title').text((d) => this.findVertex(d.v).inputWeight);

        let temp = circles.enter().append('circle').attr('cx', function (d) {
            return d.f.p.x;
        }).attr('cy', function (d) {
            return d.f.p.y;
        }).attr('r', this.svg.vRad)
            .on('click', function (d) {
                return this.changeActive(d.v);
            })
        temp.append('title').text((d) => this.findVertex(d.v).inputWeight);
        temp.transition().duration(500).attr('cx', function (d) {
            return d.p.x;
        }).attr('cy', function (d) {
            return d.p.y;
        })
            .attr('class', (d) => {
                let v = this.findVertex(d.v);
                return v.vertexError ? (v.v == this.active ? 'activeError' : 'error') : (v.v == this.active ? 'active' : "")
            });

        circles.exit().remove();

        let labels = d3.select("#g_labels").selectAll('text').data(this.getVertices());

        labels.text(function (d) {
            return d.l;
        }).transition().duration(500)
            .attr('x', function (d) {
                return d.p.x;
            }).attr('y', function (d) {
            return d.p.y + 5;
        });
        labels.append('title').text((d) => this.findVertex(d.v).inputWeight);

        temp = labels.enter().append('text').attr('x', (d) => {
            return d.f.p.x;
        }).attr('y', (d) => {
            return d.f.p.y + 5;
        })
            .text((d) => {
                return d.l;
            }).on('click', (d) => {
                return this.changeActive(d.v);
            })
        temp.transition().duration(500)
            .attr('x', function (d) {
                return d.p.x;
            }).attr('y', function (d) {
            return d.p.y + 5;
        })
        temp.append('title').text((d) => this.findVertex(d.v).inputWeight);

        labels.exit().remove();
    }

    private reLabel(label: any) {
        console.log("relabel (TreeGenerate.js): перезагрузка всплывающих подсказок");

        function relbl(t) {
            t.l = label.lbl[t.v];
            t.c.forEach(relbl);
        }

        relbl(this.vis);
        label.incMatx = label.incMatx;
    }

    private getLeafCount() {
        console.log("getLeafCount (TreeGenerate.js): получаем порядок вершины");

        if (_.c.length == 0) return 1;
        else return _.c.map(getLeafCount).reduce(function (a, b) {
            return a + b;
        });
    }

    private rePosition(v: any) {
        console.log("reposition (TreeGenerate.js): перезаписываем позиции вершин");
        let lC = this.getLeafCount(v), left = v.p.x - this.w * (lC - 1) / 2;
        v.c.forEach(function (d) {
            let w = this.w * this.getLeafCount(d);
            left += w;
            d.p = {x: left - (w + this.w) / 2, y: v.p.y + this.h};
            this.rePosition(d);
        });
    }

    private initialize() {


        console.log("initialize (TreeGenerate.js): инициализация дерева")

        d3.select("#my-canvas").append("div").attr('id', 'navdiv');

        d3.select("#navdiv").append("button").attr('type', 'button').text('+')
            .on('click', function () {
                return this.inputAndCheck();
            });

        d3.select("#navdiv").append("button").attr('type', 'button').text('-')
            .on('click', function () {
                return this.removeLeaf(this.active);
            });

        d3.select("#my-canvas")
            .append("svg")
            .attr("width", this.svg.svgW + "%")
            .attr("height", this.svg.svgH + "%")
            .attr('id', 'treesvg')
            .attr('viewBox', "0 0 600 600");

        d3.select("#treesvg")
            .append('g')
            .attr('id', 'g_lines')
            .selectAll('line')
            .data(tree.getEdges())
            .enter()
            .append('line')
            .attr('x1', function (d) {
                return d.p1.x;
            }).attr('y1', function (d) {
            return d.p1.y;
        })
            .attr('x2', function (d) {
                return d.p2.x;
            }).attr('y2', function (d) {
            return d.p2.y;
        });

        d3.select("#treesvg")
            .append('g')
            .attr('id', 'g_circles')
            .selectAll('circle')
            .data(tree.getVertices())
            .enter()
            .append('circle').attr('cx', function (d) {
            return d.p.x;
        }).attr('cy', function (d) {
            return d.p.y;
        }).attr('r', this.svg.vRad)
            .on('click', (d) => {
                return this.changeActive(d.v);
            })
            .append('title').text((d) => this.findVertex(d.v).inputWeight);

        d3.select("#treesvg")
            .append('g')
            .attr('id', 'g_labels')
            .selectAll('text')
            .data(this.getVertices())
            .enter()
            .append('text')
            .attr('x', function (d) {
                return d.p.x;
            }).attr('y', function (d) {
            return d.p.y + 5;
        }).text(function (d) {
            return d.l;
        })
            .on('click', (d) => {
                return this.changeActive(d.v);
            })
            .append('title').text((d) => this.findVertex(d.v).inputWeight);
    }

}
