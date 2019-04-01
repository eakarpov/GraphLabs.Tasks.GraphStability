import * as React from 'react';
import {Template, Toolbar, ToolButtonList, GraphVisualizer} from 'graphlabs.core.template';
import Tree from "./tree";

class App extends Template {
    private tree?: Tree;

    constructor(props: any) {
        super(props);
    }

    public componentDidMount(): void {
        this.tree = new Tree();
    }

    // public calculate() {
    //     let res = 10;
    //     return {success: res === 0, fee: res};
    // }

    public task() {
        return () => <GraphVisualizer/>
    }

    public getArea() {
        return (
            () => <div id={'my-canvas'}/>
            )
    }

    public getTaskToolbar() {
        Toolbar.prototype.getButtonList = () => {
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
        return Toolbar;
    }
}

export default App
