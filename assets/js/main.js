const pokemonList = document.getElementById('pokemonList');
const loadMoreButton = document.getElementById('loadMoreButton');
const pokemonCard = document.getElementById('pokemon-card');
const backgroundMask = document.getElementById('background-mask');
const returnButton = document.getElementById('return-button');
const likeButton = document.getElementById('like-button');


// add lista de likes
let likePokemons = [];
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
        li_element.classList.add(colorName);
        if (likePokemons.includes(pokemon.name)) {
            let li_number = li_element.getElementsByClassName('number')[0];
            li_number.classList.add('liked-li');
            li_number.style.opacity = "0.7";
            
        }
    })
}

function loadPokemonItens(offset, limit) {
    pokeApi.getPokemons(offset, limit).then((pokemons = [])=> {
        const newli = pokemons.map(convertPokemonToLi).join('')
        pokemonList.innerHTML += newli
        pokemons.map(getPokemonColor)
    })
}

function addPokemonLikes() {
    const li_elements = document.getElementsByClassName('pokemon')
    for (pokemon of li_elements) {
        let pokemon_name = pokemon.getElementsByClassName('name')[0].innerHTML
        let pokemon_number = pokemon.getElementsByClassName('number')[0]
        if (likePokemons.includes(pokemon_name)) {
            pokemon_number.classList.add('liked-li');
            pokemon_number.style.opacity = "0.7";
        }
    }
}

function removePokemonLikes() {
    const li_elements = document.getElementsByClassName('pokemon')
    for (pokemon of li_elements) {
        let pokemon_name = pokemon.getElementsByClassName('name')[0].innerHTML
        let pokemon_number = pokemon.getElementsByClassName('number')[0]
        if (!likePokemons.includes(pokemon_name)) {
            pokemon_number.classList.remove('liked-li');
            pokemon_number.style.opacity = "0.3";
        }
    }
}

// Shows a card with the pokemon status
pokemonList.addEventListener('DOMSubtreeModified', () => {
    pokemonList.querySelectorAll('.pokemon').forEach((li) => {
        li.addEventListener('click', () => {
            let pokemon_name = li.querySelector('.name').innerHTML;
            backgroundMask.classList.add('show-card');
            BuildPokemonCard(pokemon_name);
        })
    })
})

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

//pokemonCard.addEventListener('click', ()=> console.log('clicou dentro'))
backgroundMask.addEventListener('click', ()=> {
    pokemonCard.classList.remove('show-card');
    backgroundMask.classList.remove('show-card');
})

returnButton.addEventListener('click', () => {
    pokemonCard.classList.remove('show-card');
    backgroundMask.classList.remove('show-card');
})

likeButton.addEventListener('click', () => {
    let cardName = pokemonCard.getElementsByClassName('card-name')[0].innerHTML
    if (!likePokemons.includes(cardName)) {
        likePokemons.push(cardName);
        addPokemonLikes();
        console.log(likePokemons)
        likeButton.getElementsByClassName('like-icon')[0].classList.add('liked');
    } else {
        likePokemons.splice(likePokemons.indexOf(cardName), 1);
        removePokemonLikes();
        likeButton.getElementsByClassName('like-icon')[0].classList.remove('liked');
    }
    
})
