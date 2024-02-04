/**
 * Virtual node
 */
export class VNode {
    constructor(public type: any, public props: any, public children: any[]) {
        this.type = type;
        this.props = props;
        this.children = children;
    }
}

export type HoneyRootContainer = HTMLElement & {
    _vnode: VNode | null;
};

/**
 * Create a virtual node
 * @param type - The type of the node
 * @param props - The props of the node
 * @param children - The children of the node
 * @returns A virtual node
 */
export const createElement = (type: any, props: any, ...children: any[]) => {
    return new VNode(type, props, children);
};
