// Game display and pagination state
let currentGames = [];
let displayedGames = 40;
const gamesPerLoad = 40;

// Modal elements
const modal = document.getElementById('gameModal');
const modalContent = document.getElementById('gameModalContent');
const closeModalBtn = modal.querySelector('.close-modal');

// Close modal when clicking the close button or outside the modal
closeModalBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.getAttribute('aria-hidden')) {
        closeModal();
    }
});

function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
}

function openModal(game) {
    // Create modal content
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2 id="gameModalTitle">${game.title}</h2>
        </div>
        <div class="modal-body">
            <div class="game-images">
                ${game.images ? game.images.map(img => `
                    <img src="${img}" alt="Screenshot from ${game.title}" loading="lazy"
                         onerror="this.onerror=null; this.src='https://placehold.co/600x400?text=Image+Not+Found'">
                `).join('') : ''}
            </div>
            <div class="game-details">
                <a href="https://steamunlocked.net/${game.filename.replace('.html', '')}" 
                   class="btn btn-primary btn-large download-btn" 
                   target="_blank" 
                   rel="noopener noreferrer">
                    <i class="fas fa-download"></i> Download Game
                </a>
            </div>
        </div>
    `;

    // Show modal
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
}

function createGameCard(game) {
    const gameCard = document.createElement('div');
    gameCard.className = 'game-card';
    const imageUrl = game.images && game.images[0] ? game.images[0] : 'https://placehold.co/600x400?text=No+Image';
    
    gameCard.innerHTML = `
        <img src="${imageUrl}" 
             alt="${game.title}" 
             loading="lazy"
             onerror="this.onerror=null; this.src='https://placehold.co/600x400?text=Image+Not+Found'">
        <div class="game-info">
            <h3>${game.title}</h3>
        </div>
    `;

    // Add click event to open modal
    gameCard.addEventListener('click', () => openModal(game));
    
    return gameCard;
}

function addShowMoreButton() {
    const existingButton = document.querySelector('.show-more-btn');
    if (existingButton) {
        existingButton.remove();
    }

    if (displayedGames < currentGames.length) {
        const showMoreBtn = document.createElement('button');
        showMoreBtn.className = 'btn btn-primary btn-large show-more-btn';
        showMoreBtn.textContent = 'Show More';
        showMoreBtn.addEventListener('click', loadMoreGames);
        
        const gamesSection = document.querySelector('.games-section');
        gamesSection.appendChild(showMoreBtn);
    }
}

function loadMoreGames() {
    const gamesGrid = document.getElementById('gamesGrid');
    const nextBatch = currentGames.slice(displayedGames, displayedGames + gamesPerLoad);
    
    nextBatch.forEach(game => {
        gamesGrid.appendChild(createGameCard(game));
    });
    
    displayedGames += gamesPerLoad;
    addShowMoreButton();
}

async function loadGames() {
    try {
        const response = await fetch('output.json');
        currentGames = await response.json();
        const gamesGrid = document.getElementById('gamesGrid');
        const featuredGamesContainer = document.getElementById('featuredGames');

        // Clear containers
        featuredGamesContainer.innerHTML = '';
        gamesGrid.innerHTML = '';

        // Display featured games
        let featuredGamesFound = 0;
        featuredGames.forEach(featuredGameTitle => {
            const game = currentGames.find(g => g.title.trim() === featuredGameTitle.trim());
            if (game) {
                featuredGamesContainer.appendChild(createGameCard(game));
                featuredGamesFound++;
            }
        });

        if (featuredGamesFound === 0) {
            featuredGamesContainer.innerHTML = '<p>Featured games not available at the moment.</p>';
        }

        // Display initial set of games
        currentGames.slice(0, displayedGames).forEach(game => {
            gamesGrid.appendChild(createGameCard(game));
        });

        // Add Show More button if there are more games
        addShowMoreButton();
    } catch (error) {
        console.error('Error loading games:', error);
        document.getElementById('gamesGrid').innerHTML = '<p>Error loading games. Please try again later.</p>';
        document.getElementById('featuredGames').innerHTML = '<p>Error loading featured games. Please try again later.</p>';
    }
}

// Load games when the page is ready
document.addEventListener('DOMContentLoaded', loadGames);