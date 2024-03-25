export function bind(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const boundMethod = descriptor.value.bind(target);
    target[propertyKey] = boundMethod;
    return boundMethod;
}

// export function bindProperty(target: any, propertyKey: string) {
//   const boundMethod = target[propertyKey].bind(target);
//   target[propertyKey] = boundMethod;
//   return boundMethod;
// }
