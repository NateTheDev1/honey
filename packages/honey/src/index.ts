import { createElement } from './createElement';
import { render } from './renderer';
import { renderRouter } from './router';

export * from './adapters/index';

export { navigate } from './router';

export default { createElement, render, renderRouter };

const version = '1.1.0';
export const getVersion = () => version;
