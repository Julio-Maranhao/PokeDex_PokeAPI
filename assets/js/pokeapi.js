const pokeApi = {}

pokeApi.listPokemons = () => {
    // Use to create a dropdown search of pokemon
    let pokemon_list = []
    const url = "https://pokeapi.co/api/v2/pokedex/2"
    
    fetch(url)
        .then((response) => response.json())
        .then((pokemons) => {
            for (let pokemon of pokemons.pokemon_entries) {
                pokemon_list.push(pokemon.pokemon_species.name)
            }
        })
        .catch((error) => console.log(error));
    
    return pokemon_list
}

function convertDetailToPokemon (detail) {
    const pokemon = new Pokemon()
    pokemon.number = detail.id
    pokemon.name = detail.name
    pokemon.photo = detail.sprites.other['official-artwork']['front_default']
    pokemon.types = detail.types.map((slot) => slot.type.name)
    pokemon.color = detail.species.url

    return pokemon
}


pokeApi.getPokemonDetails = (pokemon) => {
    return fetch(pokemon.url)
    .then((response) => response.json())
    .then((convertDetailToPokemon))
}

pokeApi.getPokemons = (offset = 0, limit = 10) => {
    // Get a list of a page of pokemon
    const url = "https://pokeapi.co/api/v2/pokemon?"

    return fetch(url + new URLSearchParams({
                offset: offset,
                limit: limit,
    }))
        .then((response) => response.json())
        .then((jsonBody) => jsonBody.results)
        .then((pokemons) => pokemons.map(pokeApi.getPokemonDetails))
        .then((detailsRequest) => Promise.all(detailsRequest))
        .then((pokemonsDetails) => pokemonsDetails)
}

