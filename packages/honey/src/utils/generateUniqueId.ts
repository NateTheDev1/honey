/**
 * Generate a unique id for a component. Prefixed with honey_ to avoid conflicts with other libraries.
 * @returns a unique id
 */
export function generateUniqueId(): string {
    return 'honey_' + Math.random().toString(36).substr(2, 9);
}
