export function getLocalStorage<T>(key: string): T | null {
    const data = localStorage.getItem(key);
    if (data) {
        return JSON.parse(data);
    } else {
        return null;
    }
}

export function setLocalStorage<T>(key: string, value: T): boolean {
    if (!value) return false;
    localStorage.setItem(key, JSON.stringify(value));
    return true;
}

export function removeLocalStorage(key: string) {
    localStorage.removeItem(key);
}