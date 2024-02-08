interface SerializedNode {
    type: number;
    tagName?: string;
    attributes?: { [key: string]: string | null };
    children: SerializedNode[];
    textContent?: string | null;
}

export const serializeNode = (node: Node): SerializedNode => {
    const obj: SerializedNode = {
        type: node.nodeType,
        children: []
    };

    if (node.nodeType === Node.ELEMENT_NODE) {
        // Element
        const element = node as Element;
        obj.tagName = element.tagName.toLowerCase();
        obj.attributes = {};
        Array.from(element.attributes).forEach(attr => {
            obj.attributes![attr.nodeName] = attr.nodeValue;
        });
    } else if (node.nodeType === Node.TEXT_NODE) {
        // Text
        obj.textContent = node.textContent;
    }

    // Recursively serialize child nodes if it's not a text node (to avoid unnecessary recursion)
    if (node.nodeType !== Node.TEXT_NODE) {
        node.childNodes.forEach(child => {
            obj.children.push(serializeNode(child));
        });
    }

    return obj;
};

let lastSentMessage: {
    version: string;
    mode: string;
    tree: SerializedNode;
} | null = null;

export const initDevTools = () => {
    const HONEY_ENV: string = String(process.env.HONEY_ENV || 'development');

    const evData = {
        version: '1.1.2',
        mode: HONEY_ENV,
        tree: serializeNode(document.body)
    };

    if (
        lastSentMessage &&
        JSON.stringify(lastSentMessage) === JSON.stringify(evData)
    ) {
        return;
    }

    const event = new CustomEvent('HoneyAppData', {
        detail: {
            ...evData
        }
    });

    lastSentMessage = evData;

    setTimeout(() => {
        window.dispatchEvent(event);
    }, 500);
};
