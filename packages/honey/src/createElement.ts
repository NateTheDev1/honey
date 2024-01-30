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

export const createElement = (type: any, props: any, ...children: any[]) => {
    return new VNode(type, props, children);
};
