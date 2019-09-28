import {ITreeNode} from "./ITreeNode";

/**
 * @classdesc
 * TreeNode<T> implementation of the ITreeNode interface
 */
export class TreeNode<T> implements ITreeNode<T> {

  /**
   * @property
   * @private
   * Max identifier of list of nodes
   */
  public static lastId: number = 0;
  /**
   * @property
   * @public
   * MNode's identifier
   */
  public id: number;
  /**
   * @property
   * @public
   * Node's parent identifier
   */
   public parentId?: number;
  /**
   * @property
   * @public
   * Node's label
   */
  public label: string;
  /**
   * @property
   * @public
   * Node's weight
   */
  public weight: T;
  /**
   * @property
   * @public
   * The list of node's children
   */
  public children: Array<TreeNode<T>> = [];

  /**
   * @constructor
   */
  constructor(label: string, weight: T) {
       this.id = ++TreeNode.lastId;
       this.label = label;
       this.weight = weight;
       this.children = [];
   }
  /**
   * @public
   * Gets the node's unique identifier
   */
  public getId(): number {
    return this.id;
  }
  /**
   * @public
   * Gets the node's label
   */
  public getLabel(): string {
    return this.label;
  }
  /**
   * @public
   * Adds the new node's child
   * @param parentId
   * @param label
   * @param weight
   */
  public addChild(parentId: number, label: string, weight: T): void {
    const node = this.getNodeById(parentId);
    node.children.push(new TreeNode<T>(label, weight));
  }
  /**
   * @public
   * Removes node
   * @param nodeId
   */
   public removeNode(nodeId: number): void {
     const parentNode = this.deepNodeSearch((n: TreeNode<T>) => n.children.some((e: TreeNode<T>) => e.id === nodeId));
     if (parentNode === void 0) { throw Error("Root cannot be removed."); }
     (parentNode).children = (parentNode).children.filter((e: TreeNode<T>) => e.id !== nodeId);
   }
  /**
   * @public
   * Finds node by id
   * @param nodeId
   * @returns {TreeNode<T>}
   */
   public getNodeById(nodeId: number): TreeNode<T> {
     const node = this.deepNodeSearch((n: TreeNode<T>) => n.id === nodeId);
     if (node === void 0) { throw Error("No node found by specified id."); }
     return node;
   }
   /**
    * @public
    * Gets all nodes
    * @returns {TreeNode<T>[]}
    */
   public getNodeList(): Array<TreeNode<T>> {
     const childrenNodeList:Array<TreeNode<T>> = this.children.map((e: TreeNode<T>) => e.getNodeList()).reduce((a,b) => a.concat(b), []);
     const self: TreeNode<T> = this;
     return [self].concat(childrenNodeList).sort((a,b) => a.getId() - b.getId());
   }
   /**
    * @public
    * Finds node by condition
    * @param predicate
    * @returns {TreeNode<T> | void}
    */
   public deepNodeSearch(predicate: (node: TreeNode<T>) => boolean): TreeNode<T> | void {
     if (predicate(this)) { return this; }
     if (this.children.length > 0) {
         return this.children.map((e: TreeNode<T>) => e.deepNodeSearch(predicate)).filter((e: TreeNode<T> | void) => e !== void 0)[0];
     }
     return void 0;
   }
}
