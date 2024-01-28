import { createElement } from './createElement';
import { render } from './renderer';
// import { HoneyComponent } from './components/HoneyComponent';
// import { HoneyState } from './state/HoneyState';

export default { createElement, render };

const version = '0.0.1';
export const getVersion = () => version;

export const init = (rootElementId: string) => {};
