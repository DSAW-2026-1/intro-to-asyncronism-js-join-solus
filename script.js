const searchBtn = document.getElementById('search-btn');
const shinyBtn = document.getElementById('shiny-btn');
const screen = document.getElementById('display-screen');
const pokemonViewer = document.getElementById('pokemon-viewer'); // Selector para aplicar el fondo
const infoWrapper = document.getElementById('pokemon-info-wrapper');
const imgContainer = document.getElementById('pokemon-img-container');
const digits = [document.getElementById('d1'), document.getElementById('d2'), document.getElementById('d3'), document.getElementById('d4')];
const prevFormBtn = document.getElementById('prev-form');
const nextFormBtn = document.getElementById('next-form');

let currentId = Math.floor(Math.random() * 898) + 1;
let varieties = [];
let varietyIndex = 0;
let isShiny = false;
let pokemonData = null;

// Fondo pixelado original proporcionado (Ho-Oh vs Lugia)
const pixelBackground = 'https://p4.wallpaperbetter.com/wallpaper/122/911/667/pokemon-pokemon-gold-and-silver-ho-oh-pokemon-lugia-pokemon-wallpaper-preview.jpg';

// Función para actualizar los dígitos en el panel izquierdo Pokeball
const updateUIDigits = () => {
    const idStr = currentId.toString().padStart(4, '0');
    idStr.split('').forEach((num, i) => digits[i].innerText = num);
};

const fetchPokemon = async () => {
    imgContainer.innerHTML = '<h2 class="placeholder pixel-text" style="color:white">LOADING...</h2>';
    try {
        // Obtenemos especie para ver formas (varieties)
        const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${currentId}`);
        if (!speciesRes.ok) throw new Error("No encontrado");
        const speciesData = await speciesRes.json();

        varieties = speciesData.varieties;
        varietyIndex = 0;

        // Mostrar flechas solo si hay más de una forma
        const showArrows = varieties.length > 1;
        prevFormBtn.style.display = showArrows ? 'block' : 'none';
        nextFormBtn.style.display = showArrows ? 'block' : 'none';

        // Cargar el fondo pixelado fijo de Ho-Oh y Lugia
        pokemonViewer.style.backgroundImage = `url('${pixelBackground}')`;

        await loadVariety(varieties[0].pokemon.url);
    } catch (e) {
        console.error(e);
        imgContainer.innerHTML = '<h2 class="placeholder pixel-text" style="color:white">NOT FOUND</h2>';
    }
};

const loadVariety = async (url) => {
    const res = await fetch(url);
    pokemonData = await res.json();
    renderSprite();

    const typesHTML = pokemonData.types.map(t =>
    `<span class="type-icon type-${t.type.name}">${t.type.name}</span>`
    ).join('');

    // Estructura de información detallada (como en image_1.png)
    infoWrapper.innerHTML = `
    <div class="info-box">
    <span class="pixel-text">#${currentId.toString().padStart(3, '0')}</span>
    <h1 class="pixel-text">${pokemonData.name.replace(/-/g, ' ')}</h1>
    </div>
    <div class="types-list">${typesHTML}</div>
    `;
};

const renderSprite = () => {
    if (!pokemonData) return;
    const mode = isShiny ? 'shiny' : 'normal';

    // Ruta para GIFs 3D animados
    const spriteUrl = `https://projectpokemon.org/images/${mode}-sprite/${pokemonData.name}.gif`;

    // Fallback: Sprite oficial de PokeAPI si falla el GIF animado
    const fallbackUrl = isShiny ? pokemonData.sprites.front_shiny : pokemonData.sprites.front_default;

    imgContainer.innerHTML = `
    <img src="${spriteUrl}"
    class="pokemon-sprite"
    onerror="this.onerror=null; this.src='${fallbackUrl}'; this.style.imageRendering='pixelated';">
    `;
};

// Controles de ID (Panel Izquierdo)
document.getElementById('next-btn').onclick = () => { if(currentId < 898) { currentId++; updateUIDigits(); } };
document.getElementById('prev-btn').onclick = () => { if(currentId > 1) { currentId--; updateUIDigits(); } };

// Botón Buscar (Panel Izquierdo)
searchBtn.onclick = fetchPokemon;

// Controles de Variantes (Formas en pantalla derecha)
nextFormBtn.onclick = () => {
    varietyIndex = (varietyIndex + 1) % varieties.length;
    loadVariety(varieties[varietyIndex].pokemon.url);
};
prevFormBtn.onclick = () => {
    varietyIndex = (varietyIndex - 1 + varieties.length) % varieties.length;
    loadVariety(varieties[varietyIndex].pokemon.url);
};

// Control Shiny (Panel Derecho)
shinyBtn.onclick = () => {
    isShiny = !isShiny;
    shinyBtn.className = `special-btn ${isShiny ? 'shiny-on' : 'shiny-off'}`;
    renderSprite();
};

// Inicio
updateUIDigits();
fetchPokemon();
