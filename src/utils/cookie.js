const parse = (request) => {
    const cookies = request.headers.cookie;
    const split = cookies.split(';');

    const map = new Map();

    for (const cookie of split) {
        const index = cookie.indexOf('=');

        const key = cookie.substring(0, index).trim();
        const value = cookie.substring(index + 1).trim();

        map.set(key, value);
    }

    return map;
};

module.exports = parse;