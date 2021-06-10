export default function bind<T extends object>(target: T) {
    const cache: { [idx: string]: HTMLElement } = {};
    return new Proxy(target, {
        set(obj, prop, value) {
            if (prop) {
                const key = String(prop);
                const el = cache[key] || document.querySelector(`[data-bind\\:${key}]`);
                if (el) {
                    el.innerHTML = value;
                }
                cache[key] = el;
            }
            //@ts-expect-error
            return Reflect.set(...arguments);
        },
    });
}
