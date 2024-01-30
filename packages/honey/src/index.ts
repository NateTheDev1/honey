import { createElement } from './createElement';
import { render } from './renderer';
export {
    inspectLifecycle,
    createJar,
    createGlobalJar,
    getGlobalJar
} from './adapters';

export { delayLoad } from './delayLoad';

export default { createElement, render };

const version = '1.0.1';
export const getVersion = () => version;
