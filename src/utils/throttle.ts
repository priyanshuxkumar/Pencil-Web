export function throttle<T extends unknown[]>(fn: (...args: T) => void, delay: number) {
    let timer: number | undefined = undefined;

    return function (...args: T) {
        if (timer === undefined) {
            fn(...args);
            timer = setTimeout(() => {
                timer = undefined;
            }, delay);
        }
    };
}
