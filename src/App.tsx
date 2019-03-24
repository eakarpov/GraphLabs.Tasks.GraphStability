import * as React from 'react';
import {GraphVisualizer, TaskTemplate, TaskToolbar, ToolButtonList} from 'graphlabs.core.template';
import Tree from "./tree";

class App extends TaskTemplate {
    private tree?: Tree;

    constructor() {
        super({});
    }

    public componentDidMount(): void {
        this.tree = new Tree();
    }

    // public calculate() {
    //     let res = 10;
    //     return {success: res === 0, fee: res};
    // }

    public task() {
        return () => <GraphVisualizer />;
    }

    public getArea() {
        return (
            () => <div id={'my-canvas'}/>
        )
    }

    public getTaskToolbar() {
        TaskToolbar.prototype.getButtonList = () => {
            ToolButtonList.prototype.help = () => `В данном задании вы должны построить дерево, посадить сына и срубить дом`;
            ToolButtonList.prototype.toolButtons = {
                '+': () => {
                    if (this.tree) { this.tree.addLeaf() }
                },
                '-': () => {
                    if (this.tree) { this.tree.removeLeaf() }
                }
            };
            return ToolButtonList;
        };
        return TaskToolbar;
    }
}

export default App;
