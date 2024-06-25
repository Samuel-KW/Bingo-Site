
// [...$0.querySelectorAll('p')].map(e => e.textContent.trim().toUpperCase().replaceAll(' ', '').replaceAll('\'', ''))
const correctCodes = ['635c671498c06b904c7b47aae29a4ce78e294f86fc1d72b922e17ad885ee06a6', '93afc84d9a0b787e2c7e72db8093ca3490c3de4679ed1590c69e9b477f2a6f42', '12a6cb523a88c24c8c9964c38377be0566e889d97b84b0acba315e98700cdc07', 'a3c6990f4ea9896ca23798b30ead49afba1ca5394692959f4a654257d15bd6a6', 'bb4fcf9cd3fe86b45578d3e1188aad8a613e9ed47ac4327df724cddbf0e9b555', '6a7e6fbabf3e4d2e95f6983229a7f55a47c2c0e27833139999bafd925b74fe3f', '724cf508b060263027db380c5b564a327c31962732e5d6730e63f94c5fee6421', '26ba2dd2bb42f7dec275590d238da2860441cc05260ca76ff62a462d5312a1cc', '30606aa4f3942edf007ef4020281b2d3a2f4afbc6c09c0094b127402b059dbe9', '74fbef183b4df98186b27318f559502474fd5b0f06a2b4f45ba28fbd273071de', '8320c49bbc528d7ef1c177afb9e3f914af6538424f11d86a6ef96adc6f3a8eff', '35e89e9d64b2b0b7c373e0eed913e423b17f416a7dc98d9141de95acf9149324', 'ca7ceb9635c962d97a538723ed749c94f6630f67ad477e037f60ccbc82756f6e', 'd37354a1ee3c7be5e4b9a929f0d3f8ec6b53e915d36c49b023d2247b36ea9245', 'b7bd356e2b12f4ae7fb672cc863bfdeae83cd415dc76209c07d4661761bd5494', 'f1f2471f79a40cf516a83279504b288e3d10bd925bf119ea5c74f7b989dc96b0'];

let bingoCodes = new Set();

try {
    const codes = JSON.parse(localStorage.getItem('bingoCodes'));
    for (const code of codes) 
        bingoCodes.add(code);

    console.log('Loaded bingo from local storage:', bingoCodes);
} catch (e) {
    console.error('Failed to load bingo from local storage:', e);
    localStorage.setItem('bingoCodes', '[]');
}

const checkBingoCode = code => {
    const sha = sha256(code);
    return correctCodes.includes(sha);
};

const addBingoCode = code => {
    if (checkBingoCode(code)) {
        bingoCodes.add(code);
        saveBingoCodes();
        return true;
    }

    return false;
};

const saveBingoCodes = () => {
    const codes = [...bingoCodes];
    localStorage.setItem('bingoCodes', JSON.stringify(codes));
    console.log('Saved bingo to local storage:', codes);
};