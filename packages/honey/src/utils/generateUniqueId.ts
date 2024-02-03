// Utility function to generate a unique identifier
export function generateUniqueId(): string {
    return 'honey_' + Math.random().toString(36).substr(2, 9);
}
