export const styleizeLog = (log: string, style: string) => {
    console.log(`%c${log}`, `color: ${style}; font-weight: bold;`);
};
