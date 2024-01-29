import { createElement } from './createElement';
import { render } from './renderer';

export default { createElement, render };

const version = '1.0.0';
export const getVersion = () => version;
