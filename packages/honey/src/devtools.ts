import {
    HONEY_DEVTOOL_INIT_EVENT,
    HONEY_SELECTOR_ACTIVE_EVENT,
    HONEY_SELECTOR_CLOSE_EVENT,
    HONEY_SELECTOR_RESULT_EVENT
} from './constants';
import { isHoneySelectorActive, setHoneySelectorActive } from './globalState';
import { getRouterConfig } from './router';

interface SerializedNode {
    type: number;
    tagName?: string;
    attributes?: { [key: string]: string | null };
    children: SerializedNode[];
    textContent?: string | null;
}

type HoneyDevToolInitEvent = CustomEvent<{
    version: string;
    mode: string;
    tree: SerializedNode;
    usingRouter?: boolean;
    url: string;
    title: string;
}>;

type HoneySelectorActiveEvent = CustomEvent<boolean>;

type HoneySelectorResultEvent = CustomEvent<SerializedNode>;

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

let lastSentMessage: HoneyDevToolInitEvent['detail'] | null = null;

export const initDevTools = () => {
    const HONEY_ENV: string = String(process.env.HONEY_ENV || 'development');

    const evData = {
        version: '1.1.2',
        mode: HONEY_ENV,
        tree: serializeNode(document.body),
        usingRouter: getRouterConfig() !== null,
        url: window.location.href,
        title: document.title
    };

    if (
        lastSentMessage &&
        JSON.stringify(lastSentMessage) === JSON.stringify(evData)
    ) {
        return;
    }

    const event: HoneyDevToolInitEvent = new CustomEvent(
        HONEY_DEVTOOL_INIT_EVENT,
        {
            detail: {
                ...evData
            }
        }
    );

    lastSentMessage = evData;

    setTimeout(() => {
        window.dispatchEvent(event);
    }, 500);

    window.addEventListener(HONEY_SELECTOR_ACTIVE_EVENT, (e: any) => {
        setHoneySelectorActive(e.detail);
    });

    document.addEventListener(
        'mouseover',
        function (event) {
            if (!isHoneySelectorActive()) {
                return;
            }

            // Highlight the element under the mouse cursor
            const targetElement = event.target;

            if (!targetElement || !(targetElement instanceof HTMLElement)) {
                return;
            }

            targetElement.style.background = 'rgba(248, 195, 60, 10.5)';
            targetElement.style.borderRadius = '3px';
            targetElement.style.cursor = 'pointer';
            targetElement.style.opacity = '0.5';

            // Prevent multiple borders on nested elements
            event.stopPropagation();

            const serializedElement = serializeNode(targetElement);

            window.dispatchEvent(
                new CustomEvent(HONEY_SELECTOR_RESULT_EVENT, {
                    detail: serializedElement
                })
            );
        },
        true
    );

    document.addEventListener(
        'mouseout',
        function (event) {
            if (!isHoneySelectorActive()) {
                return;
            }

            if (!event.target || !(event.target instanceof HTMLElement)) {
                return;
            }

            // Remove the highlight from the element
            event.target.style.background = '';
            event.target.style.borderRadius = '';
            event.target.style.cursor = '';
            event.target.style.opacity = '';
        },
        true
    );

    document.addEventListener(
        'click',
        function (event) {
            if (!isHoneySelectorActive()) {
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

            // Revert
            event.target.style.background = '';
            event.target.style.borderRadius = '';
            event.target.style.cursor = '';
            event.target.style.opacity = '';

            setHoneySelectorActive(false);

            window.dispatchEvent(
                new CustomEvent(HONEY_SELECTOR_CLOSE_EVENT, {
                    detail: {
                        honeySelectorClose: true
                    }
                })
            );

            window.dispatchEvent(
                new CustomEvent(HONEY_SELECTOR_RESULT_EVENT, {
                    detail: serializedElement
                })
            );
        },
        true
    );
};
