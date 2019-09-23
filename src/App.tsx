import * as React from 'react';
import {Template, Toolbar, ToolButtonList, GraphVisualizer} from 'graphlabs.core.template';
import Tree from "./tree";

class App extends Template {
    private tree?: Tree;

    constructor(props: {}) {
        super(props);
        this.calculate = this.calculate.bind(this);
        this.handler = this.handler.bind(this);
    }

    public componentDidMount(): void {
        this.tree = new Tree();
    }

    public handler(values: number[][]) {
        // Do nothing
    }

    public calculate() {
        let res = 0;
        return { success: res === 0, fee: res };
    }

    public task() {
        return () => (<div>
          <div>Найдите все пустые подграфы приведенного ниже графа с помощью алгоритма построения дерева</div>
          <GraphVisualizer/>
        </div>)
    }

    public getArea() {
        return (
            () => <div id={'my-canvas'}/>
          )
    }

    public getTaskToolbar() {
        Toolbar.prototype.getButtonList = () => {
            ToolButtonList.prototype.help = () => `Для добавления пустого подграфа в ответ нажмите кнопку 'Ввести пустой подграф'`;
            ToolButtonList.prototype.toolButtons = {
                'https://img.icons8.com/metro/26/000000/plus-math.png': () => {
                    if (this.tree) { this.tree.addChild() }
                },
                'https://img.icons8.com/metro/26/000000/minus-math.png': () => {
                    if (this.tree) { this.tree.removeNode() }
                }
            };
            return ToolButtonList;
        };
        return Toolbar;
    }
}

export default App
