import { getCurrentRenderingComponent } from '../../globalState';

type SecureStorageOptions = {
    key: string;
    secret: string;
};

export type SecureStorage = {
    get: () => Promise<string | null>;
    set: (value: string) => Promise<void>;
    remove: () => void;
};

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const getKey = async (rawKey: string) => {
    const key = await window.crypto.subtle.importKey(
        'raw',
        textEncoder.encode(rawKey),
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
    return key;
};

const encryptData = async (text, key) => {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = textEncoder.encode(text);
    const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoded
    );
    return {
        iv: Array.from(iv),
        data: Array.from(new Uint8Array(encrypted))
    };
};

const decryptData = async (iv, encryptedData, key) => {
    const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(iv) },
        key,
        new Uint8Array(encryptedData)
    );
    return textDecoder.decode(decrypted);
};

export const createSecureStorage = (
    options: SecureStorageOptions
): SecureStorage => {
    const { key, secret } = options;

    const componentId = getCurrentRenderingComponent();

    if (!componentId) {
        throw new Error(
            'createSecureStorage can only be called from within a component'
        );
    }

    const storageKey = `${componentId}-${key}`;

    return {
        get: async () => {
            const key = await getKey(secret);
            const item = localStorage.getItem(storageKey);
            if (!item) return null;
            const { iv, data } = JSON.parse(item);
            return await decryptData(iv, data, key);
        },
        set: async (value: string) => {
            const key = await getKey(secret);
            const { iv, data } = await encryptData(value, key);
            localStorage.setItem(storageKey, JSON.stringify({ iv, data }));
        },
        remove: () => {
            localStorage.removeItem(storageKey);
        }
    };
};
