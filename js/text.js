const toKebabCase = str =>
    str &&
    str
        .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        .map(x => x.toLowerCase())
        .join('-');

const formatNumber = (n, m) => n.toLocaleString(undefined, {
    minimumFractionDigits: m ? m : 0,
    maximumFractionDigits: m ? m : 0
});

const renderNumericCell = ({value}) => formatNumber(value)

export {toKebabCase, formatNumber, renderNumericCell}

