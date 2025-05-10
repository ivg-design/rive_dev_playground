export const argbToHex = (a) => {
    if (typeof a !== 'number') return `NOT_AN_ARGB_NUMBER (${typeof a}: ${a})`;
    return '#' + (a & 0xffffff).toString(16).padStart(6, '0').toUpperCase();
}; 