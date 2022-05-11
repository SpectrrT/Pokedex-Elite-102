export const getPokemon = (name) => {
    const BASE_URL = 'https://pokeapi.co/api/v2/pokemon';
    fetch(`${BASE_URL}/${name}`)
        .then(response => response.json())
        .then(json => json)
        .catch(err => console.log(`Error occurred: ${err.message}`));
}