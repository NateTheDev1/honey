export const createAccessabilityReport = (rootElementId: string) => {
    const rootElement = document.getElementById(rootElementId);
    const report = {
        get value() {
            return rootElement?.innerHTML;
        },
        set: (newValue: string) => {
            if (rootElement) {
                rootElement.innerHTML = newValue;
            }
        }
    };
    return report;
};
