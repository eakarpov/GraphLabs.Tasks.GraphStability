import {IEdge, IGraph, IVertex} from "graphlabs.core.graphs";
import {getNeighbours, getSubgraph, getNonNeighbours} from './graph';
import {Notifier} from "graphlabs.core.notifier";
import Tree from "./tree";

interface ITreeNode {
    label: string;
    graph: IGraph<IVertex, IEdge>;
    calculatedWeight: string[];
    inputWeight: string[];
    hasVertexError: boolean;
    hasWeightError: boolean;
    position: {x: number; y: number};
    children: TreeNode[];
}

export default class TreeNode {

    public static getInstance(node: ITreeNode): TreeNode {
        return new TreeNode(node);
    }

    private static lastId: number = 0;

    public label: string;
    public graph: IGraph<IVertex, IEdge>;
    public calculatedWeight: string[];
    public inputWeight: string[];
    public hasVertexError: boolean;
    public hasWeightError: boolean;
    public children: TreeNode[];

    private position: {x: number; y: number};
    private readonly id: number;

    private constructor(node: ITreeNode) {
        this.id = TreeNode.lastId++;
        this.label = node.label;
        this.graph = node.graph;
        this.calculatedWeight = node.calculatedWeight;
        this.inputWeight = node.inputWeight;
        this.hasWeightError = node.hasWeightError;
        this.hasVertexError = node.hasVertexError;
        this.children = node.children;
        this.position = node.position;
    }

    public getId(): number {
        return this.id;
    }

    public getLabel(): string {
        return this.label;
    }

    public getPosition(): {x: number; y: number} {
        if (this.position === void 0) { throw Error("Position wasn't specified")}
        return this.position;
    }

    public setPosition(pos: {x: number; y: number}) {
        if (this.position === void 0) { this.position = pos; }
        if (pos.x !== this.position.x) { this.position.x = pos.x; }
        if (pos.y !== this.position.y) { this.position.y = pos.y; }
    }

    public addLeaf(parentId: number, label: string, vertexArray: string[]): void {
        const node = this.getNodeById(parentId);
        const isError: boolean = this.checkVertex(node, label);
        node.children.push(TreeNode.getInstance({
            label,
            graph: getSubgraph(vertexArray, node.graph),
            calculatedWeight: getNonNeighbours(label, node.graph),
            inputWeight: vertexArray,
            hasVertexError: isError,
            hasWeightError: this.checkWeight(isError, getNonNeighbours(label, node.graph), vertexArray),
            position: {...node.position},
            children: []
        }));
    }

    public removeLeaf(nodeId: number): void {
        const parentNode = this.deepNodeSearch((n: TreeNode) => n.children.some((e: TreeNode) => e.id === nodeId));
        if (parentNode === void 0) { throw Error("Root cannot be removed."); }
        parentNode.children = parentNode.children.filter((e: TreeNode) => e.id !== nodeId);
    }

    public getNodeById(id: number): TreeNode {
        const node = this.deepNodeSearch((n: TreeNode) => n.id === id);
        if (node === void 0) { throw Error("No node found by specified id."); }
        return node;
    }

    public getNodeList(): TreeNode[] {
        const childrenNodeList:TreeNode[] = this.children.map((e: TreeNode) => e.getNodeList()).reduce((a,b) => a.concat(b), []);
        const self: TreeNode = this;
        return [self].concat(childrenNodeList).sort((a,b) => a.getId() - b.getId());
    }

    public deepNodeSearch(predicate: (node: TreeNode) => boolean): TreeNode | void {
        if (predicate(this)) { return this; }
        if (this.children.length > 0) {
            return this.children.map((e: TreeNode) => e.deepNodeSearch(predicate)).find((e: TreeNode | void) => e !== void 0);
        }
        return void 0;
    }

    private checkWeight(isError: boolean, real: string[], input: string[]) {
        if (isError) {
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
        } else {
            // проверяем, что введенное множество вершин соответствует рассчитанной неокрестности вершины
            // если несоответствие, то записываем ошибку
            if (real.sort().toString() === input.sort().toString()) {
                return false
            } else {
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

    private checkVertex(parentNode: TreeNode, label: string) {
        // проверка, есть ли введенная вершина в графе
        if (this.graph.vertices.map((e: IVertex) => e.name).includes(label)) {
            // проверка, есть ли введенная вершина в графе, соответствующем узлу-родителю
            if (parentNode.graph.vertices.map((e: IVertex) => e.name).includes(label)) {
                // проверка, есть ли у вершины родителя еще потомки
                if (parentNode.children.length === 0) {
                    return false;
                } else {
                    // проверка, дублирует ли введенная вершина одну из вершин своего уровня
                    if (!parentNode.children.map((e: TreeNode) => e.getLabel()).includes(label)) {
                        // проверка, входит ли добавляемая вершина в окрестность первого узла потомка
                        const firstChild = this.getNodeById(Math.min(...parentNode.children.map(e => e.id)));
                        if (getNeighbours(firstChild.getLabel(), parentNode.graph).includes(label)) {
                            return false;
                        } else {
                            Notifier.send({
                                fee: 5,
                                datetime: new Date().getTime(),
                                message: "Введенная вершина не входит в окрестность первого потомка выбранной вершины",
                                variantId: 0,
                                isTaskFinished: false,
                            });
                            return true;
                        }
                    } else {
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
            } else {
                Notifier.send({
                    fee: 5,
                    datetime: new Date().getTime(),
                    message: "Вершины с данным именем нет в графе, соответствующем узлу-родителю",
                    variantId: 0,
                    isTaskFinished: false,
                });
                return true;
            }
        } else {
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
}
