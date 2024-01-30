import { createElement } from './createElement';
import { render } from './renderer';

export * from './adapters/index';

export default { createElement, render };

const version = '1.0.1';
export const getVersion = () => version;
