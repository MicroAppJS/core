'use strict';

module.exports = function getPadLength(obj) {
    let longest = 10;
    if (Array.isArray(obj)) {
        obj.forEach(({ name }) => {
            if (name && name.length + 1 > longest) {
                longest = name.length + 1;
            }
        });
    } else {
        for (const name in obj) {
            if (name.length + 1 > longest) {
                longest = name.length + 1;
            }
        }
    }
    return longest;
};
