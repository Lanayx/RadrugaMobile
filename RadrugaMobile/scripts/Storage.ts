export class PermanentStorage {
    static set(key: string, value: string) {
        localStorage.setItem(key, value);
    }
    static get(key: string) : string {
        return localStorage.getItem(key);
    }

    static remove(key: string) {
        localStorage.removeItem(key);
    }

    static clear() {
        localStorage.clear();
    }
}