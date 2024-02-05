/**
 * Generate a unique id for a component. Prefixed with honey_ to avoid conflicts with other libraries.
 * @returns a unique id
 */
export function generateUniqueId(): string {
    return 'honey_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Generate a unique id for a component. Prefixed with the componentId to avoid conflicts with other libraries.
 * @param componentId - The id of the component
 * @returns a unique id
 */
export function generateUniqueIdForComponent(componentId: string): string {
    return componentId + '_' + generateUniqueId();
}
