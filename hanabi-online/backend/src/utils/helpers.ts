export function uid(prefix = "id_"): string {
    return prefix + Math.random().toString(36).slice(2, 10);
}

export function shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

export function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}