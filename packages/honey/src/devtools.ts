interface SerializedNode {
    type: number;
    tagName?: string;
    attributes?: { [key: string]: string | null };
    children: SerializedNode[];
    textContent?: string | null;
}

let honeySelectorActive = false;

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

    window.addEventListener('HoneySelectorActive', (e: any) => {
        console.log('HoneySelectorActive', e.detail);
        honeySelectorActive = e.detail;
    });

    document.addEventListener(
        'mouseover',
        function (event) {
            if (!honeySelectorActive) {
                return;
            }

            // Highlight the element under the mouse cursor
            const targetElement = event.target;

            if (!targetElement || !(targetElement instanceof HTMLElement)) {
                return;
            }

            // targetElement.style.border = '2px solid red';

            // Sharp, modern look
            targetElement.style.border = '2px solid #ff0000';
            targetElement.style.borderRadius = '3px';
            targetElement.style.cursor = 'pointer';
            targetElement.style.opacity = '0.5';

            // Prevent multiple borders on nested elements
            event.stopPropagation();

            const serializedElement = serializeNode(targetElement);

            window.dispatchEvent(
                new CustomEvent('HoneySelectorResult', {
                    detail: serializedElement
                })
            );
        },
        true
    );

    document.addEventListener(
        'mouseout',
        function (event) {
            if (!honeySelectorActive) {
                return;
            }

            if (!event.target || !(event.target instanceof HTMLElement)) {
                return;
            }

            // Remove the highlight from the element
            event.target.style.border = '';
            event.target.style.borderRadius = '';
            event.target.style.cursor = '';
            event.target.style.opacity = '';
        },
        true
    );

    document.addEventListener(
        'click',
        function (event) {
            if (!honeySelectorActive) {
                return;
            }

            // Prevent the click from performing its default action
            event.preventDefault();
            event.stopPropagation();

            if (!event.target || !(event.target instanceof HTMLElement)) {
                return;
            }

            // Serialize the clicked element
            const serializedElement = serializeNode(event.target);

            window.dispatchEvent(
                new CustomEvent('HoneySelectorResult', {
                    detail: serializedElement
                })
            );
        },
        true
    );
};
