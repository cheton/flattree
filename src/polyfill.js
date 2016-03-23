// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
if (!Array.isArray) {
    Array.isArray = function(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
if (typeof Object.assign !== 'function') {
    Object.assign = function (target, ...sources) {
        if (target === undefined || target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        const output = Object(target);
        for (let index = 0; index < sources.length; index++) {
            const source = sources[index];
            if (source !== undefined && source !== null) {
                for (let key in source) {
                    if (source.hasOwnProperty(key)) {
                        output[key] = source[key];
                    }
                }
            }
        }
        return output;
    };
}
