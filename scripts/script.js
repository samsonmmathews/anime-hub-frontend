const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const results = document.getElementById('results');

// Function to escape HTML to prevent injection
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Search button click event
searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        fetchAnime(query);
    }
});

async function fetchAnime(query) {
    results.innerHTML = `<p>Loading...</p>`; // Show loading state

    try {
        const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=12`);
        if (!res.ok) throw new Error('API error');

        const data = await res.json();
        displayAnime(data.data);
    } catch (err) {
        console.error(err);
        results.innerHTML = `<p style="color:red;">Failed to fetch anime. Try again.</p>`;
    }
}

function displayAnime(animeList) {
    if (animeList.length === 0) {
        results.innerHTML = `<p>No results found.</p>`;
        return;
    }

    results.innerHTML = animeList.map(anime => `
        <div class="anime-card">
            <img src="${anime.images.jpg.image_url}" alt="${escapeHtml(anime.title)}">
            <div class="card-body">
                <div class="title">${escapeHtml(anime.title)}</div>
                <div class="sub">Episodes: ${anime.episodes || 'N/A'}</div>
                <div class="card-actions">
                    <button class="view-btn" data-id="${anime.mal_id}">View</button>
                    <button class="add-btn" data-id="${anime.mal_id}" data-title="${escapeHtml(anime.title)}">Add</button>
                </div>
            </div>
        </div>
    `).join('');
}

const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.getElementById('closeModal');

// Open modal with anime details
results.addEventListener('click', async (e) => {
    if (e.target.classList.contains('view-btn')) {
        const animeId = e.target.dataset.id;

        try {
            const res = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/full`);
            if (!res.ok) throw new Error('API error');

            const data = await res.json();
            showModal(data.data);
        } catch (err) {
            console.error(err);
            alert('Failed to fetch anime details.');
        }
    }
});

// Function to populate and show modal
function showModal(anime) {
    modalBody.innerHTML = `
        <h2>${escapeHtml(anime.title)}</h2>
        <img src="${anime.images.jpg.image_url}" alt="${escapeHtml(anime.title)}" style="width:100%; max-height:400px; object-fit:cover; border-radius:10px; margin-bottom:12px;">
        <p><strong>Episodes:</strong> ${anime.episodes || 'N/A'}</p>
        <p><strong>Status:</strong> ${anime.status}</p>
        <p><strong>Score:</strong> ${anime.score || 'N/A'}</p>
        <p>${escapeHtml(anime.synopsis || 'No description available.')}</p>
    `;
    modal.style.display = 'block';
}

// Close modal
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Close modal when clicking outside content
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

