import { getCurrentRenderingComponent } from '../../globalState';

export type ConsentCategory =
    | 'analytics'
    | 'marketing'
    | 'functional'
    | 'preferences'
    | 'security'
    | 'performance'
    | 'advertising'
    | 'unclassified';

export type ConsentStatus = {
    [key in ConsentCategory]?: boolean;
};

type ConsentManagementOptions = {
    defaultStatus?: ConsentStatus;
};

export type ConsentManagement = {
    getStatus: () => ConsentStatus;
    updateStatus: (category: ConsentCategory, consented: boolean) => void;
    resetStatus: () => void;
};

/**
 * Create a consent management object to handle user consent preferences.
 * @param options - Options for the consent management object.
 * @returns A consent management object.
 */
export const createConsentManagement = (
    options: ConsentManagementOptions = {}
): ConsentManagement => {
    const componentId = getCurrentRenderingComponent();

    if (!componentId) {
        throw new Error(
            'createConsentManagement can only be called from within a component'
        );
    }

    const storageKey = `${componentId}-consentStatus`;
    const defaultStatus: ConsentStatus = options.defaultStatus || {};

    // Helper to get the current consent status from localStorage or return default
    const getConsentStatus = (): ConsentStatus => {
        const stored = localStorage.getItem(storageKey);
        return stored ? JSON.parse(stored) : defaultStatus;
    };

    // Helper to save the consent status to localStorage
    const saveConsentStatus = (status: ConsentStatus) => {
        localStorage.setItem(storageKey, JSON.stringify(status));
    };

    return {
        getStatus: () => {
            return getConsentStatus();
        },
        updateStatus: (category: ConsentCategory, consented: boolean) => {
            const currentStatus = getConsentStatus();
            const updatedStatus = { ...currentStatus, [category]: consented };

            window.dispatchEvent(
                new CustomEvent('consentChange', {
                    detail: { ...updatedStatus }
                })
            );

            saveConsentStatus(updatedStatus);
        },
        resetStatus: () => {
            window.dispatchEvent(
                new CustomEvent('consentChange', {
                    detail: defaultStatus
                })
            );
            saveConsentStatus(defaultStatus);
        }
    };
};

/**
 * Listen for changes to the consent status and call a callback when it changes.
 * @param callback - The callback to call when the consent status changes.
 * @returns A function to stop listening for changes.
 */
export const inspectConsentManager = (
    callback: (status: ConsentStatus) => void
) => {
    const listener = () => {
        callback(createConsentManagement().getStatus());
    };
    window.addEventListener('consentChange', listener);
    return () => {
        window.removeEventListener('consentChange', listener);
    };
};
