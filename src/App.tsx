import * as React from 'react';
import {GraphVisualizer, TaskTemplate, TaskToolbar, ToolButtonList} from 'graphlabs.core.template';
import Tree from "./tree";

class App extends TaskTemplate {
    private readonly tree: Tree;

    constructor() {
        super({});
        this.tree = new Tree();
    }

    public calculate() {
        console.log("calculate (App.js)");
        let res = 10;
        return {success: res === 0, fee: res};
    }

    public task() {
        console.log("task (App.js)");
        return () => <GraphVisualizer />;
    }

    public getArea() {
        return () => (
            <div id={'my-canvas'}></div>
        )
    }

    public getTaskToolbar() {
        console.log("getTaskToolbar (App.js): возвращаем панель инструментов, начало");
        TaskToolbar.prototype.getButtonList = () => {
            ToolButtonList.prototype.help = () => `В данном задании вы должны построить дерево, посадить сына и срубить дом`;
            ToolButtonList.prototype.toolButtons = {
                '+': () => {
                    if (this.tree) this.tree.addLeaf()
                },
                '-': () => {
                    if (this.tree) this.tree.removeLeaf()
                }
            };
            console.log("getTaskToolbar (App.js): возвращаем список кнопок на пенли инструментов");
            return ToolButtonList;
        };
        console.log("getTaskToolbar (App.js): возвращаем панель инструментов со всеми кнопками");
        return TaskToolbar;
    }
}

export default App;
