
function createPokemonCardHtml (pokemon) {
    console.log(pokemon)
    // Set base color
    document.documentElement.style.setProperty('--main-color', pokemonColors[pokemon.color]);
    // Set header card content
    pokemonCard.getElementsByClassName('card-name')[0].innerHTML = pokemon.name;
    pokemonCard.getElementsByClassName('card-number')[0].innerHTML = `#${pokemon.number}`;
    pokemonCard.getElementsByClassName('card-types')[0].innerHTML = pokemon.types.map( type => `<li class="card-type ${type}">${type}</li>`).join('');
    pokemonCard.getElementsByClassName('card-image')[0].src = pokemon.photo;
    let like_icon = pokemonCard.getElementsByClassName('like-icon')[0];
    if (likePokemons.includes(pokemon.name)) {
        if (!like_icon.classList.contains('liked')) {
            like_icon.classList.add('liked')
        }
    } else {
        if (like_icon.classList.contains('liked')) {
            like_icon.classList.remove('liked')
        }
    };
    // Set ABOUT CONTENT
    document.getElementById('about-species-value').innerHTML = pokemon.species;
    document.getElementById('about-height-value').innerHTML = `${pokemon.height}m`;
    document.getElementById('about-weight-value').innerHTML = `${pokemon.weight}kg`;
    document.getElementById('about-abilities-value').innerHTML = pokemon.abilities;
    document.getElementById('about-gender-value-male-span').innerHTML = `${((8 - pokemon.genderRate) * 100 / 8).toFixed(2)}%`;
    document.getElementById('about-egg-value').innerHTML = pokemon.eggGroups;
    document.getElementById('about-hatch-value').innerHTML = pokemon.hatchSteps;
    document.getElementById('about-gender-value-female-span').innerHTML = `${((pokemon.genderRate) *100 / 8).toFixed(2)}%`;
    // set STATUS CONTENT
    for (let stat in pokemon.stats) {
        document.getElementById(`status-${stat}-value`).innerHTML = pokemon.stats[stat];
        if (stat === 'total') {
            document.getElementById(`status-${stat}-bar`).innerHTML = 
            (pokemon.stats[stat] >= 300) ? `<div class="status-percent"><div class="status-percent-value good" style="width: ${(pokemon.stats[stat]*100/1200).toFixed(0)}%"></div></div>` : 
            `<div class="status-percent"><div class="status-percent-value bad" style="width: ${(pokemon.stats[stat]*100/1200).toFixed(0)}%"></div></div>`;
        } else {
            document.getElementById(`status-${stat}-bar`).innerHTML = 
            (pokemon.stats[stat] >= 50) ? `<div class="status-percent"><div class="status-percent-value good" style="width: ${(pokemon.stats[stat]*100/200).toFixed(0)}%"></div></div>` : 
            `<div class="status-percent"><div class="status-percent-value bad" style="width: ${(pokemon.stats[stat]*100/200).toFixed(0)}%"></div></div>`;
        }
    }
    // set EVOLUTIONS CONTENT
    pokemon.evolutions.forEach((evolution, i) => {
        document.getElementById(`evo-${i + 1}`).innerHTML = evolution.map(evo => {
            return `
                <img src="https://img.icons8.com/ios-filled/50/null/long-arrow-down.png">
                <span class="chain-trigger">${evo.trigger}</span>
                <span class="chain-name">${evo.name}</span>
            `
        })
    });
    // set MOVES CONTENT
    let pokemonMoves = `
    <div class="moves-row op-5">
        <span>Name</span>
        <span>Level</span>
        <span>Method</span>
    </div>`;
    pokemon.moves.sort((a, b) => a.method.localeCompare(b.method) || a.level - b.level || a.name.localeCompare(b.name)).map(move => {
        pokemonMoves += `
        <div class="moves-row">
            <span>${move.name}</span>
            <span>${move.level}</span>
            <span>${move.method}</span>
        </div>`
    });
    document.getElementById('moves-table').innerHTML = pokemonMoves;
    // Show card at the end
    pokemonCard.classList.add('show-card');
}


function BuildPokemonCard (pokemon) {
    const fullPokemon = {};
    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}/`)
    .then((response) => response.json())
    .then((jsonBody) => getPokemonCardDetails(fullPokemon, jsonBody))
    .then((species) => fetch(species))
    .then((response) => response.json())
    .then((jsonBody) => getPokemonCardSpecies (fullPokemon, jsonBody))
    .then((evolution) => fetch(evolution))
    .then((response) => response.json())
    .then((jsonBody) => getPokemonEvolution (fullPokemon, jsonBody))
    .then((pokemon) => createPokemonCardHtml(pokemon))
}


function getPokemonCardDetails (fullPokemon, jsonBody) {
    fullPokemon.height = jsonBody.height / 10;
    fullPokemon.weight = jsonBody.weight / 10;
    fullPokemon.name = jsonBody.name;
    fullPokemon.species = jsonBody.species.name;
    fullPokemon.number = jsonBody.id;
    fullPokemon.photo = jsonBody.sprites.other['official-artwork']['front_default'];
    fullPokemon.types = jsonBody.types.map(type => type.type.name);
    fullPokemon.abilities = jsonBody.abilities.map(ability => ability.ability.name).join(', ');
    fullPokemon.stats = jsonBody.stats.map((stat) => {
        let stat_name = stat.stat.name
        let stat_value = stat.base_stat
        return {[stat_name]: stat_value}
    }).reduce((result, current) => Object.assign(result, current));
    fullPokemon.stats.total = Object.values(fullPokemon.stats).reduce((acumulator, current) => acumulator + current);
    let moves_list = jsonBody.moves.map(move => {
        let versionDetails = move.version_group_details[0]
        if (versionDetails.version_group.name === 'red-blue' || versionDetails.version_group.name === 'yellow') {
            return {
                name: move.move.name,
                level: versionDetails.level_learned_at,
                method: versionDetails.move_learn_method.name
            }
        }
    });
    fullPokemon.moves = moves_list.filter(move => move !== undefined);
    return jsonBody.species.url
}

function getPokemonCardSpecies (fullPokemon, jsonBody) {
    fullPokemon.color = jsonBody.color.name;
    fullPokemon.hatchSteps = 255 * (jsonBody.hatch_counter + 1);
    fullPokemon.eggGroups = jsonBody.egg_groups.map(group => group.name).join(', ');
    fullPokemon.genderRate = jsonBody.gender_rate ;
    return jsonBody.evolution_chain.url
}

function getPokemonEvolution (fullPokemon, jsonBody) {
    let chains = [];
    let initial = [getChainData(jsonBody.chain)];
    chains.push(initial);
    let chain1 = jsonBody.chain.evolves_to.map(getChainData);
    chains.push(chain1);
    let chain2 = jsonBody.chain.evolves_to.map(chain => chain.evolves_to)
        .map(chain_array => chain_array.map(getChainData)).flat();
    chains.push(chain2);
    fullPokemon.evolutions = chains.map(chain => chain.filter(evolution => evolution.number <= 151));
    return fullPokemon
}

function getChainData (chain) {
    let name = chain.species.name;
    let number = parseInt(chain.species.url.split('/')[6]);
    let trigger = (chain.is_baby) ? 'egg' : 'start';
    try {
        if (chain.evolution_details[0].trigger.name === 'level-up') {
            if (chain.evolution_details[0].min_level) {trigger = `(level ${chain.evolution_details[0].min_level})`};
        } else if (chain.evolution_details[0].trigger.name === 'use-item') {
            trigger = `use ${chain.evolution_details[0].item.name}`.replaceAll('-', ' ');
        }else if (chain.evolution_details[0].trigger.name === 'trade') {
            trigger = 'trade'
        }
    } catch (error) {}
    return {
        name,
        trigger,
        number
    }
}