import { HONEY_COMPONENT_ID } from '../constants';
import { getCurrentRenderingComponent } from '../globalState';

/**
 * Registers a media query to the current component.
 * @param mediaQuery The media query to register.
 */
export const registerMediaQuery = (mediaQuery: string) => {
    const componentId = getCurrentRenderingComponent();

    if (!componentId) {
        throw new Error('registerMediaQuery must be called within a component');
    }

    const style = document.createElement('style');

    style.classList.add(`honey-media-query-${componentId}`);

    style.setAttribute('type', 'text/css');

    style.innerHTML = mediaQuery;

    const element = document.querySelector(
        `[${HONEY_COMPONENT_ID}="${componentId}"]`
    );

    if (element) {
        const existing = document.querySelector(
            `.${style.classList[0]}`
        ) as HTMLStyleElement;

        if (existing) {
            existing.remove();
        }

        document.head.appendChild(style);
    }
};
