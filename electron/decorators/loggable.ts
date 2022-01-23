export default function loggable(constructor: Function) {
    const constructorsClass = constructor.prototype;
    Object.getOwnPropertyNames(constructorsClass)
        .filter(name => typeof constructorsClass[name] === 'function')
        .forEach(propertyName => {
            const descriptor = Object.getOwnPropertyDescriptor(constructorsClass, propertyName);;
            const originalMethod = descriptor.value;
            descriptor.value = function (...args: any[]) {
                const result = originalMethod.apply(this, args);
                return result;
            };

            Object.defineProperty(constructorsClass, propertyName, descriptor);
        });
}