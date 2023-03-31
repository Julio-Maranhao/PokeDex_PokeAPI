const pokemonList = document.getElementById('pokemonList');
const loadMoreButton = document.getElementById('loadMoreButton');
// limite dos pokemon que vão aparecer na busca
const maxSearch = 151;
// dados para ajustar a busca
const limit = 12;
let offset = 0;

function convertPokemonToLi(pokemon) {
    return `
    <li class="pokemon" id="pokemon${pokemon.number}">
        <span class="number">#${pokemon.number}</span>
        <span class="name">${pokemon.name}</span>
        <div class="detail">
            <ol class="types">
                ${pokemon.types.map((type) => `<li class="type ${type}">${type}</li>`).join('')}
            </ol>
            <img src="${pokemon.photo}" alt="${pokemon.name}">                    
        </div>
    </li>
    `
}

function getPokemonColor (pokemon) {
    let li_element = document.getElementById(`pokemon${pokemon.number}`)
    return fetch(pokemon.color)
    .then((response) => response.json())
    .then((jsonBody) => jsonBody.color.name)
    .then((colorName) => {
        li_element.classList.add(colorName)
    })
}

function loadPokemonItens(offset, limit) {
    pokeApi.getPokemons(offset, limit).then((pokemons = [])=> {
        console.log(pokemons)
        const newli = pokemons.map(convertPokemonToLi).join('')
        pokemonList.innerHTML += newli
        pokemons.map(getPokemonColor)
    })
}

loadPokemonItens(offset, limit)

loadMoreButton.addEventListener('click', () => {
    offset += limit
    const nextPage = offset + limit
    if (nextPage > maxSearch) {
        let newLimit = maxSearch - offset
        loadPokemonItens(offset, newLimit)

        loadMoreButton.parentElement.removeChild(loadMoreButton)
    } else {
        loadPokemonItens(offset, limit)
    }
})
