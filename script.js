// State
let audioContext;
document.addEventListener("click", function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContext.resume();
        console.log("AudioContext resumed by user gesture");
    }
    document.removeEventListener("click", initAudio);
});
let currentPlaylist = [];
let currentSongIndex = 0;
let currentLyrics = [];
let isLyricsViewOpen = false;
let audio = new Audio();
audio.preload = "auto";
audio.crossOrigin = "anonymous";
audio.setAttribute("playsinline", "");
audio.setAttribute("webkit-playsinline", "");
let previewAudio = null;
let currentPreviewInterval = null;
audio.addEventListener("ended", () => {
    if (!audio.loop) {
        // Automatically play next ensuring state transfers well in background
        playNext();
    }
});
// Update Media Session Position State (Optional but good for lockscreen scrubbers)
audio.addEventListener('timeupdate', () => {
    if ('mediaSession' in navigator && !isNaN(audio.duration) && audio.duration !== Infinity) {
        try {
            navigator.mediaSession.setPositionState({
                duration: Math.max(0, audio.duration) || 0,
                playbackRate: audio.playbackRate,
                position: Math.max(0, Math.min(audio.duration, audio.currentTime)) || 0
            });
        } catch (e) { } // Catch Edge cases with extreme numbers
    }
});
// audio.crossOrigin = "anonymous"; // Commenting out to allow playback if server lacks CORS support
let currentView = 'home';
// DOM Elements
const views = {
    home: document.getElementById('home-view'),
    dashboard: document.getElementById('dashboard-view'),
    album: document.getElementById('album-view'),
    search: document.getElementById('search-view'),
    liked: document.getElementById('liked-view'),
    artist: document.getElementById('artist-view'),
    browse: document.getElementById('browse-view'), // New View
    lyrics: document.getElementById('lyrics-view')
};
// Navigation History
let navHistory = [];
let isNavigatingBack = false;
// Library State
let library = JSON.parse(localStorage.getItem('neonLibrary')) || [];
let selectedLanguages = ['Hindi', 'English']; // Default
const allLanguages = [
    "Hindi", "English", "Punjabi", "Tamil", "Telugu",
    "Marathi", "Gujarati", "Bengali", "Kannada", "Bhojpuri",
    "Malayalam", "Sanskrit", "Haryanvi", "Rajasthani", "Odia", "Assamese"
];
// Liked Songs
let likedSongs = JSON.parse(localStorage.getItem('likedSongs')) || [];
let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
function toggleLike(song) {
    const index = likedSongs.findIndex(s => s.id === song.id);
    if (index > -1) {
        likedSongs.splice(index, 1);
    } else {
        // Save full song object to avoid lookup issues later if data is dynamic
        // Or just ID. Using ID + basic info is safer. Let's save object for now as it's small app
        likedSongs.push(song);
    }
    localStorage.setItem('likedSongs', JSON.stringify(likedSongs));
    // Update UI if on Liked Page
    if (currentView === 'liked') {
        renderLikedSongs();
    }
    // Update buttons in current view
    updateLikeButtons(song.id);
}
// Recently Played State
let recentlyPlayed = JSON.parse(localStorage.getItem('neonRecentlyPlayed')) || [];
function addToRecentlyPlayed(item) {
    if (!item || !item.id) return;
    // Avoid duplicates - remove if exists
    const index = recentlyPlayed.findIndex(i => i.id === item.id);
    if (index > -1) {
        recentlyPlayed.splice(index, 1);
    }
    // Add to front
    recentlyPlayed.unshift(item);
    // Limit to 20
    if (recentlyPlayed.length > 20) {
        recentlyPlayed.pop();
    }
    localStorage.setItem('neonRecentlyPlayed', JSON.stringify(recentlyPlayed));
    renderRecentlyPlayed();
}
function renderRecentlyPlayed() {
    const grid = document.getElementById('recent-played-grid');
    const section = document.getElementById('recently-played-section');
    if (!grid || !section) return;
    // Data Hydration & Cleaning Strategy:
    // 1. Map current history items to their latest source in 'songs' or 'albums'
    // 2. Filter out items that no longer exist or are invalid
    let cleanedHistory = [];
    let hasChanges = false;
    recentlyPlayed.forEach(item => {
        if (!item || !item.id) {
            hasChanges = true;
            return;
        }
        // Try to find the fresh object from source of truth
        let freshItem = null;
        // Check if it's a song
        const songMatch = typeof songs !== 'undefined' ? songs.find(s => s.id === item.id) : null;
        if (songMatch) {
            freshItem = songMatch;
        } else {
            // Check if it's an album
            const albumMatch = typeof albums !== 'undefined' ? albums.find(a => a.id === item.id) : null;
            if (albumMatch) {
                freshItem = albumMatch;
            }
        }
        // Use fresh item if found, otherwise check if the existing item is valid enough to keep
        // If it's not found in source (e.g. deleted dummy album), we DROP it.
        if (freshItem) {
            // Check if we need to update the stored copy
            if (JSON.stringify(item) !== JSON.stringify(freshItem)) {
                hasChanges = true;
            }
            cleanedHistory.push(freshItem);
        } else {
            // Item not found in data.js (e.g. was a deleted dummy album)
            hasChanges = true;
        }
    });
    // Update state and storage if we cleaned anything
    if (hasChanges) {
        recentlyPlayed = cleanedHistory;
        localStorage.setItem('neonRecentlyPlayed', JSON.stringify(recentlyPlayed));
    }
    if (recentlyPlayed.length === 0) {
        section.style.display = 'none';
        return;
    }
    section.style.display = 'block';
    grid.innerHTML = '';
    recentlyPlayed.forEach(item => {
        // Determine type for click action
        // Inferred type based on properties if not explicit
        const type = item.type || (item.songs ? 'Album' : 'Song');
        let clickHandler;
        if (type === 'Album') {
            clickHandler = () => openAlbum(item);
        } else if (type === 'Artist') {
            clickHandler = () => openArtistPage(item.name);
        } else {
            // Song
            clickHandler = () => {
                currentPlaylist = [item];
                currentSongIndex = 0;
                playSong(item);
            };
        }
        const card = createCard(
            item.title || item.name,
            item.artist || 'Artist',
            item.cover || item.image,
            clickHandler,
            item,
            type.toLowerCase()
        );
        // Adjust card style for carousel if needed
        card.style.minWidth = '150px';
        grid.appendChild(card);
    });
}
function isLiked(songId) {
    return likedSongs.some(s => s.id === songId);
}
function updateLikeButtons(songId) {
    const btns = document.querySelectorAll(`.like-btn[data-id="${songId}"]`);
    btns.forEach(btn => {
        const liked = isLiked(songId);
        btn.innerHTML = liked ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>';
        btn.style.color = liked ? '#1db954' : '#b3b3b3';
        btn.classList.toggle('active', liked);
    });
}
const player = {
    playBtn: document.getElementById('play-btn'),
    prevBtn: document.getElementById('prev-btn'),
    nextBtn: document.getElementById('next-btn'),
    title: document.getElementById('np-title'), // This element might not exist in new layout? checking...
    artist: document.getElementById('np-artist'), // This element might not exist in new layout? checking...
    video: document.getElementById('loop-video'),
    progressFill: document.getElementById('progress-fill'),
    currTime: document.getElementById('curr-time'),
    totalTime: document.getElementById('dur-time'), // Changed from total-time
    progressBar: document.getElementById('progress-container'), // Changed ID
    volumeSlider: document.getElementById('volume-slider')
};
// Initialization
function init() {
    renderHome();
    setupEventListeners();
    setupNavigation();
    setupLanguageModal();
    setupSortDropdown();
    loadPlayerState();
}
function setupEventListeners() {
    // Player Controls
    if (player.playBtn) player.playBtn.addEventListener('click', togglePlay);
    if (player.nextBtn) player.nextBtn.addEventListener('click', playNext);
    if (player.prevBtn) player.prevBtn.addEventListener('click', playPrev);
    // Media Session API for background playback
    if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => {
            audio.play()
                .then(() => updatePlayButton())
                .catch(err => console.error("MediaSession Play Error:", err));
        });
        navigator.mediaSession.setActionHandler('pause', () => {
            audio.pause();
            updatePlayButton();
        });
        navigator.mediaSession.setActionHandler('previoustrack', playPrev);
        navigator.mediaSession.setActionHandler('nexttrack', playNext);
        // Optional: Support seeking in background if desired
        // navigator.mediaSession.setActionHandler('seekto', (details) => {
        //    if (details.fastSeek && 'fastSeek' in audio) {
        //      audio.fastSeek(details.seekTime);
        //    } else {
        //      audio.currentTime = details.seekTime;
        //    }
        // });
    }
    // Mini Next Button
    const miniNextBtn = document.getElementById('mini-next-btn');
    if (miniNextBtn) {
        miniNextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            playNext();
        });
    }
    // Desktop Space Bar Toggle
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            const activeTag = document.activeElement.tagName.toUpperCase();
            if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') return;
            e.preventDefault(); // Prevent scrolling
            togglePlay();
        }
    });
    // Back Button
    const backBtn = document.getElementById('nav-back-btn');
    if (backBtn) backBtn.addEventListener('click', goBack);
    const albumBackBtn = document.getElementById('album-back-btn');
    if (albumBackBtn) albumBackBtn.addEventListener('click', goBack);
    if (backBtn) {
        backBtn.addEventListener('click', goBack);
    }
    // Full Screen Button
    const fsBtn = document.getElementById('fullscreen-btn');
    if (fsBtn) {
        fsBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                });
                fsBtn.innerHTML = '<i class="fa-solid fa-compress"></i>';
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                    fsBtn.innerHTML = '<i class="fa-solid fa-expand"></i>';
                }
            }
        });
        // Listen for escape key or other exit methods
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                fsBtn.innerHTML = '<i class="fa-solid fa-expand"></i>';
            } else {
                fsBtn.innerHTML = '<i class="fa-solid fa-compress"></i>';
            }
        });
    }
    // New Controls Actions
    const shuffleBtn = document.getElementById('shuffle-btn');
    const loopBtn = document.getElementById('loop-btn');
    const muteBtn = document.getElementById('mute-btn');
    if (shuffleBtn) {
        shuffleBtn.addEventListener('click', () => {
            isShuffleOn = !isShuffleOn; // Update State!
            shuffleBtn.classList.toggle('active', isShuffleOn);
            shuffleBtn.style.color = isShuffleOn ? 'var(--primary-color)' : '#b3b3b3';
            if (typeof updateMiniPlayerUI === 'function') updateMiniPlayerUI();
        });
    }
    if (loopBtn) {
        loopBtn.addEventListener('click', () => {
            audio.loop = !audio.loop;
            loopBtn.style.color = audio.loop ? 'var(--primary-color)' : '#b3b3b3';
            if (typeof updateMiniPlayerUI === 'function') updateMiniPlayerUI();
        });
    }
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            // Logic handled by click
            audio.muted = !audio.muted;
            if (audio.muted) {
                muteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
                if (player.volumeSlider) player.volumeSlider.value = 0;
            } else {
                muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
                if (player.volumeSlider) player.volumeSlider.value = audio.volume || 1;
            }
            if (typeof updateMiniPlayerUI === 'function') updateMiniPlayerUI();
        });
    }
    if (player.volumeSlider) {
        player.volumeSlider.addEventListener('input', (e) => {
            audio.volume = e.target.value;
            if (audio.volume == 0) {
                audio.muted = true;
                if (muteBtn) muteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
            } else {
                audio.muted = false;
                if (muteBtn) muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
            }
        });
    }
    // Audio Events
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener("play", updatePlayButton);
    audio.addEventListener("pause", updatePlayButton);
    audio.addEventListener('loadedmetadata', () => {
        if (player.totalTime) player.totalTime.innerText = formatTime(audio.duration);
        if (typeof updateMiniPlayerUI === 'function') updateMiniPlayerUI();
    });
    audio.addEventListener('play', () => { if (typeof updateMiniPlayerUI === 'function') updateMiniPlayerUI(); });
    audio.addEventListener('pause', () => { if (typeof updateMiniPlayerUI === 'function') updateMiniPlayerUI(); });
    audio.addEventListener("play", () => {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = "playing";
        }
    });
    audio.addEventListener("pause", () => {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = "paused";
        }
    });
    // Progress Bar Click
    if (player.progressBar) {
        player.progressBar.addEventListener('click', (e) => {
            const width = player.progressBar.clientWidth;
            const clickX = e.offsetX;
            const duration = audio.duration;
            audio.currentTime = (clickX / width) * duration;
        });
    }
    // Sidebar Toggle
    const sidebar = document.getElementById('sidebar');
    document.getElementById('toggle-sidebar').addEventListener('click', () => {
        sidebar.classList.toggle('closed');
        document.body.classList.toggle('sidebar-closed');
        document.querySelector('#toggle-sidebar').classList.toggle('fa-rotate-180');
    });
    // Library Dropdown
    const libMenu = document.getElementById('library-menu');
    const libSub = document.getElementById('library-submenu');
    libMenu.addEventListener('click', () => {
        libSub.classList.toggle('open');
        libMenu.querySelector('.dropdown-icon').classList.toggle('fa-chevron-up');
        libMenu.querySelector('.dropdown-icon').classList.toggle('fa-chevron-down');
    });
    // Filter Navigation (Library)
    document.querySelectorAll('.submenu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const filter = e.target.dataset.filter;
            if (filter === 'liked') {
                renderLikedSongs();
            } else {
                showLibrary(filter);
            }
        });
    });
    // Search
    // Search Inputs (Desktop & Mobile)
    // Search Inputs (Desktop & Mobile)
    // Search Inputs (Desktop & Mobile)
    const searchInput = document.getElementById('search-input');
    const mobileSearchInput = document.getElementById('search-input-mobile');
    // Desktop Search Input Logic
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const clearBtn = document.getElementById('desktop-search-clear');
            // Toggle Clear Button
            if (clearBtn) clearBtn.style.display = query.length > 0 ? 'block' : 'none';
            if (window.innerWidth > 768) {
                // Desktop: Dropdown Logic
                renderDesktopSearch(query);
            } else {
                // Should not happen if mobile input is separate, but just in case
                // mobile focus logic handles it.
            }
        });
        // Toggle dropdown on focus
        searchInput.addEventListener('focus', (e) => {
            if (window.innerWidth > 768) {
                const dropdown = document.getElementById('search-dropdown');
                if (dropdown) dropdown.style.display = 'block';
                renderDesktopSearch(searchInput.value);
            } else {
                e.target.blur();
                openSearchOverlay();
            }
        });
        // Hide on blur (with delay for clicks)
        document.addEventListener('click', (e) => {
            const container = document.querySelector('.search-bar-container');
            if (container && !container.contains(e.target)) {
                const dropdown = document.getElementById('search-dropdown');
                if (dropdown) dropdown.style.display = 'none';
            }
        });
        const clearBtn = document.getElementById('desktop-search-clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                searchInput.focus();
                renderDesktopSearch('');
                clearBtn.style.display = 'none';
            });
        }
    }
    // Mobile Search Input Logic (Opens Overlay)
    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('focus', (e) => {
            e.target.blur(); // Prevent default mobile keyboard on main page
            openSearchOverlay();
        });
    }
    // Overlay Elements
    const overlayInput = document.getElementById('overlay-search-input');
    const overlayBackBtn = document.getElementById('search-back-btn');
    const overlayClearBtn = document.getElementById('overlay-clear-btn');
    const overlayInputClear = document.getElementById('overlay-search-clear'); // The X icon
    if (overlayInput) {
        // Toggle X icon helper
        const toggleOverlayX = () => {
            if (overlayInputClear) {
                overlayInputClear.style.display = overlayInput.value.trim().length > 0 ? 'block' : 'none';
            }
        };
        // Input Listener
        overlayInput.addEventListener('input', (e) => {
            toggleOverlayX();
            const query = e.target.value.toLowerCase();
            handleOverlaySearch(query);
        });
        // X Icon Click Listener
        if (overlayInputClear) {
            overlayInputClear.addEventListener('click', () => {
                overlayInput.value = '';
                toggleOverlayX();
                overlayInput.focus();
                // Reset search results (pass empty query)
                handleOverlaySearch('');
            });
        }
    }
    if (overlayBackBtn) {
        overlayBackBtn.addEventListener('click', closeSearchOverlay);
    }
    if (overlayClearBtn) {
        overlayClearBtn.addEventListener('click', clearRecent);
    }
    // Playlist Creation
    document.getElementById('create-playlist-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('playlist-dialog').style.display = 'flex';
    });
    document.getElementById('cancel-playlist').addEventListener('click', () => {
        document.getElementById('playlist-dialog').style.display = 'none';
    });
    document.getElementById('save-playlist').addEventListener('click', () => {
        const name = document.getElementById('new-playlist-name').value;
        if (name) {
            playlists.push({ id: Date.now(), name: name, songs: [] });
            renderPlaylists();
            document.getElementById('playlist-dialog').style.display = 'none';
        }
    });
    // Mini Player
    const miniPlayerBtn = document.getElementById('mini-player-btn');
    if (miniPlayerBtn) {
        miniPlayerBtn.addEventListener('click', toggleMiniPlayer);
    }
    // Browse Button (Desktop)
    const browseBtn = document.getElementById('desktop-browse-btn');
    if (browseBtn) {
        browseBtn.addEventListener('click', () => {
            showView('browse');
            renderBrowseView();
        });
    }
    renderPlaylists();
    // Show All Recently Played
    const showAllRecentBtn = document.getElementById('show-all-recent');
    if (showAllRecentBtn) {
        showAllRecentBtn.addEventListener('click', () => {
            showLibrary('history');
        });
    }
    // Show All Made For You
    const showAllMadeForYouBtn = document.getElementById('show-all-made-for-you');
    if (showAllMadeForYouBtn) {
        showAllMadeForYouBtn.addEventListener('click', () => {
            // Made For You shows albums, so redirect to Albums tab in Library
            showLibrary('albums');
        });
    }
    // Show All Popular Artists
    const showAllArtistsBtn = document.getElementById('show-all-artists');
    if (showAllArtistsBtn) {
        showAllArtistsBtn.addEventListener('click', () => {
            showLibrary('artists');
        });
    }
    // Recently Played Scroll Buttons
    const recentGrid = document.getElementById('recent-played-grid');
    const recentPrev = document.getElementById('recent-prev');
    const recentNext = document.getElementById('recent-next');
    if (recentGrid && recentPrev && recentNext) {
        recentPrev.addEventListener('click', () => {
            recentGrid.scrollBy({ left: -recentGrid.clientWidth / 2, behavior: 'smooth' });
        });
        recentNext.addEventListener('click', () => {
            recentGrid.scrollBy({ left: recentGrid.clientWidth / 2, behavior: 'smooth' });
        });
    }
    // --- Immersive Lyrics Listeners ---
    const lyricsBtn = document.getElementById('lyrics-btn');
    const lyricsCloseBtn = document.getElementById('lyrics-close-btn');
    if (lyricsBtn) lyricsBtn.addEventListener('click', toggleLyricsView);
    if (lyricsCloseBtn) lyricsCloseBtn.addEventListener('click', toggleLyricsView);
}
// Browse View Logic
function renderBrowseView() {
    const startGrid = document.getElementById('browse-start-grid');
    const allGrid = document.getElementById('browse-all-categories');
    // Prevent re-rendering if already populated
    if (startGrid.children.length > 0) return;
    const startCategories = [
        { title: 'Music', color: '#dc148c', img: 'https://i.scdn.co/image/ab67706f00000002aa93fe4d3c26d8332da75768' },
        { title: 'Podcasts', color: '#006450', img: 'https://i.scdn.co/image/ab6765630000ba8a81f07e1a92d63e9ea9562963' }, // Placeholder
        { title: 'Live Events', color: '#8400e7', img: 'https://i.scdn.co/image/ab67706f000000027ea4d505212b9de1f72c5112' }
    ];
    const allCategories = [
        { title: 'Made For You', color: '#1e3264', img: 'https://t.scdn.co/images/ea364e99656e46a096ea1df50f581efe' },
        { title: 'New Releases', color: '#e8115b', img: 'https://i.scdn.co/image/ab67706f000000027ea4d505212b9de1f72c5112' },
        { title: 'Hindi', color: '#e1118c', img: 'https://i.scdn.co/image/ab67706f000000024f2277d018659d4c79877b06' },
        { title: 'Punjabi', color: '#b02897', img: 'https://i.scdn.co/image/ab67706f000000024618eaaa682f646019572c6d' },
        { title: 'Tamil', color: '#e91429', img: 'https://i.scdn.co/image/ab67706f00000002e11a75eb1f8796500589d813' },
        { title: 'Telugu', color: '#d84000', img: 'https://i.scdn.co/image/ab67706f0000000245a499318c460d3d5f470519' },
        { title: 'Charts', color: '#8d67ab', img: 'https://charts-images.scdn.co/assets/locale_en/regional/weekly/region_global_default.jpg' },
        { title: 'Pop', color: '#148a08', img: 'https://i.scdn.co/image/ab67706f000000027ea4d505212b9de1f72c5112' },
        { title: 'Indie', color: '#e91429', img: 'https://i.scdn.co/image/ab67706f000000025f732736327ac972a9b40090' },
        { title: 'Trending', color: '#b02897', img: 'https://i.scdn.co/image/ab67706f00000002b55b6074da1d43715fc16d6d' },
        { title: 'Love', color: '#e61e32', img: 'https://i.scdn.co/image/ab67706f000000027ea4d505212b9de1f72c5112' },
        { title: 'Discover', color: '#8d67ab', img: 'https://i.scdn.co/image/ab67706f000000027ea4d505212b9de1f72c5112' },
        { title: 'Mood', color: '#e1118c', img: 'https://i.scdn.co/image/ab67706f000000027ea4d505212b9de1f72c5112' },
        { title: 'Party', color: '#537aa1', img: 'https://i.scdn.co/image/ab67706f000000027ea4d505212b9de1f72c5112' },
        { title: 'Devotional', color: '#148a08', img: 'https://i.scdn.co/image/ab67706f000000027ea4d505212b9de1f72c5112' },
        { title: 'Decades', color: '#c39687', img: 'https://i.scdn.co/image/ab67706f000000027ea4d505212b9de1f72c5112' },
        { title: 'Hip-Hop', color: '#bc5900', img: 'https://i.scdn.co/image/ab67706f000000029bb6af539d072de34548d15c' },
        { title: 'Dance / Electronic', color: '#dc148c', img: 'https://i.scdn.co/image/ab67706f000000027ea4d505212b9de1f72c5112' },
        { title: 'Student', color: '#eb1e32', img: 'https://i.scdn.co/image/ab67706f000000027ea4d505212b9de1f72c5112' },
        { title: 'Chill', color: '#477d95', img: 'https://i.scdn.co/image/ab67706f000000027ea4d505212b9de1f72c5112' },
        { title: 'Gaming', color: '#e91429', img: 'https://i.scdn.co/image/ab67706f000000027ea4d505212b9de1f72c5112' },
        { title: 'K-pop', color: '#148a08', img: 'https://i.scdn.co/image/ab67706f000000027ea4d505212b9de1f72c5112' },
        { title: 'Workout', color: '#777777', img: 'https://i.scdn.co/image/ab67706f000000027ea4d505212b9de1f72c5112' },
        { title: 'Radar', color: '#777777', img: 'https://i.scdn.co/image/ab67706f000000027ea4d505212b9de1f72c5112' },
    ];
    function createCategoryCard(cat) {
        const div = document.createElement('div');
        div.className = 'category-card';
        div.style.backgroundColor = cat.color;
        div.innerHTML = `
            <h3>${cat.title}</h3>
            <img src="${cat.img}" loading="lazy" alt="${cat.title}">
        `;
        // Click Handler (Placeholder)
        div.addEventListener('click', () => {
            console.log(`Open Category: ${cat.title}`);
            // Future: Navigate to category page
        });
        return div;
    }
    startCategories.forEach(cat => startGrid.appendChild(createCategoryCard(cat)));
    allCategories.forEach(cat => allGrid.appendChild(createCategoryCard(cat)));
}
function setupNavigation() {
    document.querySelectorAll('[data-target]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.dataset.target;
            // If navigating to Library (dashboard), reset to default view
            if (target === 'dashboard') {
                showLibrary();
            } else {
                showView(target);
            }
            // Active State
            document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
            // Also need to handle mobile bottom nav items which might not have .menu-item class or might be different
            // But preserving existing logic for .menu-item
            if (link.classList.contains('menu-item')) link.classList.add('active');
            // Handle bottom nav active state if needed (usually handled by styles or separate logic, but ensuring consistency)
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.target === target) btn.classList.add('active');
            });
        });
    });
}
// Scroll Position State
const scrollPositions = {};
function showView(viewId) {
    if (currentView === viewId) return; // Avoid duplicate moves
    // Save current scroll position
    const mainContent = document.getElementById('main-content');
    if (currentView && mainContent) {
        scrollPositions[currentView] = mainContent.scrollTop;
    }
    // History Logic
    if (!isNavigatingBack && currentView) {
        navHistory.push(currentView);
    }
    isNavigatingBack = false; // Reset flag
    // Update UI
    Object.values(views).forEach(el => { if (el) el.style.display = 'none' });
    if (views[viewId]) {
        views[viewId].style.display = viewId === 'lyrics' ? 'flex' : 'block';
    }
    if (viewId !== 'lyrics' && typeof isLyricsViewOpen !== 'undefined' && isLyricsViewOpen) {
        isLyricsViewOpen = false;
        const lyricsBtn = document.getElementById('lyrics-btn');
        const rightSidebar = document.getElementById('right-sidebar');
        if (lyricsBtn) lyricsBtn.style.color = '#b3b3b3';
        if (rightSidebar) rightSidebar.classList.remove('collapsed');
    }
    // Update State
    currentView = viewId;
    document.body.className = `view-${viewId}`; // Add class for CSS targeting
    // Restore scroll position
    if (mainContent) {
        mainContent.scrollTop = scrollPositions[viewId] || 0;
    }
    // Close Search Overlay if open (Fix for mobile overlay persistence)
    closeSearchOverlay();
    // Reset Library active state if leaving
    if (viewId !== 'dashboard') {
        // Optional: clear filters
    }
}
function goBack() {
    if (navHistory.length > 0) {
        const prev = navHistory.pop();
        isNavigatingBack = true; // Prevent pushing current view during back nav
        showView(prev);
    }
}
// Rendering Logic
function createCard(title, subtitle, image, onClick, itemData = null, type = 'general') {
    const div = document.createElement('div');
    div.className = 'card';
    if (type === 'artist') div.classList.add('artist-card');
    div.innerHTML = `
        <img src="${image}" loading="lazy" alt="${title}">
        <h3>${title}</h3>
        <p>${subtitle}</p>
        <div class="play-overlay"><i class="fa-solid fa-play"></i></div>
        <div class="card-menu-btn"><i class="fa-solid fa-ellipsis-vertical"></i></div>
    `;
    // Main Click
    div.addEventListener('click', (e) => {
        // Prevent click if menu clicked
        if (!e.target.closest('.card-menu-btn')) {
            onClick();
        }
    });
    // Menu Click
    const menuBtn = div.querySelector('.card-menu-btn');
    if (type === 'album' || type === 'playlist' || type === 'mix' || type === 'deep dive') {
        const menuType = (type === 'deep dive') ? 'album' : type; // Normalize for context menu handler
        menuBtn.addEventListener('click', (e) => {
            showContextMenu(e, itemData, menuType);
        });
    } else {
        menuBtn.style.display = 'none'; // Hide if not applicable
    }
    return div;
}
// Helper to get Made For You albums with 24h rotation
function getMadeForYouAlbums() {
    const STORAGE_KEY = 'neonMadeForYou';
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    try {
        let storedData = JSON.parse(localStorage.getItem(STORAGE_KEY));
        let now = Date.now();
        // Check if valid storage exists and is within 24 hours
        if (storedData &&
            storedData.timestamp &&
            (now - storedData.timestamp < TWENTY_FOUR_HOURS) &&
            storedData.albumIds &&
            Array.isArray(storedData.albumIds) &&
            storedData.albumIds.length > 0) {
            // Hydrate from IDs - ensure they still exist in current data
            const hydrated = storedData.albumIds
                .map(id => albums.find(a => a.id === id))
                .filter(a => a && a.title && !a.title.includes('undefined'));
            if (hydrated.length > 0) {
                return hydrated;
            }
        }
        // Generate New List if expired or invalid
        // 1. Filter valid albums (respecting selected languages if possible)
        let pool = albums.filter(a => a && a.id && a.title && a.cover && !a.title.includes('undefined'));
        // Optional: Filter by selected languages for better relevance
        if (selectedLanguages && selectedLanguages.length > 0) {
            const langPool = pool.filter(a => selectedLanguages.includes(a.language));
            if (langPool.length >= 5) { // Only use language filter if we have enough albums
                pool = langPool;
            }
        }
        // 2. Shuffle
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        // 3. Pick max 10 (User requested max 10)
        const selected = shuffled.slice(0, 10);
        // 4. Save
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            timestamp: now,
            albumIds: selected.map(a => a.id)
        }));
        return selected;
    } catch (e) {
        console.error("Error in getMadeForYouAlbums", e);
        // Fallback
        return albums.slice(0, 10);
    }
}
function renderHome() {
    // =========================
    // 🎵 MADE FOR YOU (ALBUMS)
    // =========================
    const grid = document.getElementById('featured-grid');
    if (!grid) return;
    grid.innerHTML = '';
    // Use the 24h rotation helper
    const madeForYouAlbums = getMadeForYouAlbums();
    madeForYouAlbums.forEach(album => {
        const card = createCard(
            album.title,
            album.artist,
            album.cover,
            () => openAlbum(album),
            album,
            'album'
        );
        grid.appendChild(card);
    });
    // =========================
    // 📂 POPULAR PLAYLISTS
    // =========================
    const plGrid = document.getElementById('popular-playlists');
    if (plGrid) {
        plGrid.innerHTML = '';
        playlists.forEach(pl => {
            const cover =
                songs.find(s => s.id === pl.songs[0])?.cover ||
                'https://via.placeholder.com/150/b026ff/FFFFFF?text=PL';
            const card = createCard(
                pl.name,
                `${pl.songs.length} Songs`,
                cover,
                () => console.log('Open Playlist'),
                pl,
                'playlist'
            );
            plGrid.appendChild(card);
        });
    }
    // Helper to get Popular Artists with 24h rotation
    function getPopularArtists() {
        const STORAGE_KEY = 'neonPopularArtists';
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
        try {
            let storedData = JSON.parse(localStorage.getItem(STORAGE_KEY));
            let now = Date.now();
            // Check if valid storage exists
            if (storedData &&
                storedData.timestamp &&
                (now - storedData.timestamp < TWENTY_FOUR_HOURS) &&
                storedData.artistIds &&
                Array.isArray(storedData.artistIds) &&
                storedData.artistIds.length > 0) {
                // Hydrate
                const hydrated = storedData.artistIds
                    .map(id => artists.find(a => a.id === id))
                    .filter(a => a); // Filter nulls
                if (hydrated.length > 0) {
                    return hydrated;
                }
            }
            // Generate New List
            // 1. Shuffle all artists
            const shuffled = [...artists].sort(() => 0.5 - Math.random());
            // 2. Pick max 12
            const selected = shuffled.slice(0, 12);
            // 3. Save
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                timestamp: now,
                artistIds: selected.map(a => a.id)
            }));
            return selected;
        } catch (e) {
            console.error("Error in getPopularArtists", e);
            return artists.slice(0, 12);
        }
    }
    // =========================
    // 👩‍🎤 ARTIST CAROUSEL
    // =========================
    const artistCarousel = document.getElementById('artist-carousel');
    if (artistCarousel) {
        artistCarousel.innerHTML = '';
        // Use 24h rotation helper
        const popularArtists = getPopularArtists();
        popularArtists.forEach(artist => {
            const div = document.createElement('div');
            div.className = 'artist-card';
            div.innerHTML = `
                <img src="${artist.image}" 
                     class="artist-image" 
                     loading="lazy" 
                     alt="${artist.name}">
                <div class="artist-name">${artist.name}</div>
                <div class="artist-label">Artist</div>
            `;
            div.addEventListener('click', () => {
                openArtistPage(artist.name);
            });
            artistCarousel.appendChild(div);
        });
    }
    // =========================
    // 🌌 DEEP DIVES
    // =========================
    if (window.Visualizer && typeof window.Visualizer.renderDeepDives === 'function') {
        window.Visualizer.renderDeepDives();
    }
    // =========================
    // 🕒 RECENTLY PLAYED
    // =========================
    renderRecentlyPlayed();
}
// Language Modal Logic
function setupLanguageModal() {
    const btn = document.querySelector('.nav-btn-text'); // The Language Button
    const modal = document.getElementById('language-modal');
    const grid = document.getElementById('language-grid');
    const updateBtn = document.getElementById('update-lang-btn');
    const label = btn.querySelector('span span:nth-child(2)'); // 'Hindi' text
    // Open Modal
    btn.addEventListener('click', () => {
        modal.style.display = 'flex';
        renderLanguageOptions();
    });
    // Close Modal on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });
    // Update Action
    updateBtn.addEventListener('click', () => {
        // Collect selected
        const selectedEls = Array.from(grid.querySelectorAll('.lang-option.selected'));
        selectedLanguages = selectedEls.map(el => el.dataset.lang);
        // Update Label
        if (selectedLanguages.length > 0) {
            label.innerText = selectedLanguages.join(', ').substring(0, 20) + (selectedLanguages.join(', ').length > 20 ? '...' : '');
        } else {
            label.innerText = 'Select Language';
        }
        // Re-render content
        renderHome();
        modal.style.display = 'none';
    });
    function renderLanguageOptions() {
        grid.innerHTML = '';
        allLanguages.forEach(lang => {
            const div = document.createElement('div');
            div.className = 'lang-option';
            if (selectedLanguages.includes(lang)) div.classList.add('selected');
            div.dataset.lang = lang;
            div.innerHTML = `
                <span>${lang}</span>
                <i class="fa-solid fa-circle-check check"></i>
            `;
            div.addEventListener('click', () => {
                div.classList.toggle('selected');
            });
            grid.appendChild(div);
        });
    }
}
function showLibrary(filter) {
    showView('dashboard');
    currentView = 'dashboard';
    const grid = document.getElementById('library-grid');
    const title = document.getElementById('dashboard-title');
    grid.innerHTML = '';
    if (filter === 'artists') {
        const titleText = title.querySelector('span') || title;
        if (title.tagName === 'DIV') { // If it's our new structure
            title.querySelector('span').innerText = 'Artists';
            title.querySelector('i').style.display = 'none';
            title.onclick = null; // Remove sorting click
        } else {
            title.innerText = 'Artists';
        }
        artists.forEach(artist => {
            const card = createCard(artist.name, 'Artist', artist.image, () => {
                console.log('Clicked artist', artist.name);
            }, artist, 'artist');
            grid.appendChild(card);
        });
    } else if (filter === 'albums') {
        const titleText = title.querySelector('span') || title;
        if (title.tagName === 'DIV') {
            title.querySelector('span').innerText = 'Albums';
            title.querySelector('i').style.display = 'none';
            title.onclick = null;
        } else {
            title.innerText = 'Albums';
        }
        albums.forEach(album => {
            const card = createCard(album.title, album.artist, album.cover, () => openAlbum(album), album, 'album');
            grid.appendChild(card);
        });
    } else if (filter === 'history') {
        const titleText = title.querySelector('span') || title;
        if (title.tagName === 'DIV') {
            title.querySelector('span').innerText = 'Recently Played';
            title.querySelector('i').style.display = 'none';
            title.onclick = null;
        } else {
            title.innerText = 'Recently Played';
        }
        if (recentlyPlayed.length === 0) {
            grid.innerHTML = '<div style="color:#888; grid-column: 1/-1; text-align:center; padding-top:50px;">No recently played history.</div>';
        } else {
            recentlyPlayed.forEach(item => {
                const type = item.type || (item.songs ? 'Album' : 'Song');
                let clickHandler;
                if (type === 'Album') {
                    clickHandler = () => openAlbum(item);
                } else if (type === 'Artist') {
                    clickHandler = () => openArtistPage(item.name);
                } else {
                    clickHandler = () => {
                        currentPlaylist = [item];
                        currentSongIndex = 0;
                        playSong(item);
                    };
                }
                const card = createCard(
                    item.title || item.name,
                    item.artist || 'Artist',
                    item.cover || item.image,
                    clickHandler,
                    item,
                    type.toLowerCase()
                );
                grid.appendChild(card);
            });
        }
    } else {
        // "Recently Added" View
        const titleText = title.querySelector('span');
        const icon = title.querySelector('i');
        // Use current sort mapping for title
        const sortLabels = {
            'recent': 'Recently Added',
            'title': 'Title',
            'date': 'Release Date',
            'creator': 'Creator'
        };
        if (titleText) titleText.innerText = sortLabels[currentSort] || 'Recently Added';
        if (icon) icon.style.display = 'block'; // Show dropdown arrow
        // Setup Headers click to toggle menu
        title.onclick = (e) => {
            e.stopPropagation();
            const menu = document.getElementById('sort-menu');
            if (menu) menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        };
        if (library.length === 0) {
            grid.innerHTML = '<div style="color:#888; grid-column: 1/-1; text-align:center; padding-top:50px;">Your library is empty. Add albums from the "Albums" tab.</div>';
        } else {
            // Filter albums AND deep dive content
            const allContent = [...albums, ...(typeof deepDiveContent !== 'undefined' ? deepDiveContent : [])];
            let libItems = allContent.filter(item => library.includes(item.id));
            // Sort Logic (Basic title sort for mixed content or just reverse added order)
            // Note: sort by 'date', 'creator' might fail if fields missing in deepDiveContent.
            // Default to reverse library order (Recently Added) is safest.
            if (currentSort === 'title') {
                libItems.sort((a, b) => a.title.localeCompare(b.title));
            } else if (currentSort === 'creator') {
                libItems.sort((a, b) => (a.artist || '').localeCompare(b.artist || ''));
            } else {
                // Recent
                libItems.sort((a, b) => library.lastIndexOf(b.id) - library.lastIndexOf(a.id));
            }
            libItems.forEach(item => {
                // Determine click handler based on type
                let clickHandler;
                if (item.type === 'Album') {
                    clickHandler = () => openAlbum(item);
                } else if (item.type === 'Deep Dive' || item.type === 'Visual Album' || item.type === 'Live Set' || item.type === 'Documentary') {
                    clickHandler = () => openDeepDivePage(item);
                } else {
                    clickHandler = () => openAlbum(item); // Fallback
                }
                // Cover fallback
                let cover = item.cover;
                if (!cover && item.video) cover = "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop"; // Placeholder for video types
                // Pass item and 'album' type to enable context menu (which handles library toggle)
                const card = createCard(item.title, item.artist, cover, clickHandler, item, 'album');
                grid.appendChild(card);
            });
        }
    }
}
let currentSort = 'recent';
function setupSortDropdown() {
    const menu = document.getElementById('sort-menu');
    document.querySelectorAll('.sort-option').forEach(opt => {
        opt.addEventListener('click', (e) => {
            e.stopPropagation();
            // Update Active State
            document.querySelectorAll('.sort-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            currentSort = opt.dataset.sort;
            // Hide Menu
            menu.style.display = 'none';
            // Re-render
            showLibrary('recent');
        });
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
        if (menu && menu.style.display === 'block' && !e.target.closest('#dashboard-title')) {
            menu.style.display = 'none';
        }
    });
}
function renderPlaylists() {
    const playlistContainer = document.getElementById('playlist-submenu');
    playlistContainer.innerHTML = '';
    playlists.forEach(pl => {
        const div = document.createElement('div');
        div.className = 'submenu-item';
        div.innerText = pl.name;
        div.addEventListener('click', () => {
            // Show Playlist View (Reuse Album view or similar?)
            // For now, simple log
            console.log('Open ' + pl.name);
        });
        playlistContainer.appendChild(div);
    });
}
// Album Detail Logic
// Album Detail Logic
function openAlbum(album) {
    showView('album');
    // document.getElementById('album-title').innerText = album.title; // overwritten below
    // Header Logic
    const artObj = artists.find(a => a.name === album.artist);
    const artistImg = artObj ? artObj.image : 'https://raw.githubusercontent.com/Legend123-byte/Assests/main/Poster/I1.jpg';
    const metaContainer = document.querySelector('#album-view .album-info-hero');
    if (metaContainer) {
        metaContainer.innerHTML = `
            <div class="album-header-info">
                <h5 class="album-type-label">${(album.type || 'ALBUM').toUpperCase()}</h5>
                <h1 class="album-title-hero">${album.title}</h1>
                <div class="album-creator-info">
                    <img src="${artistImg}" class="artist-mini-avatar">
                    <span class="artist-name-hero">${album.artist}</span>
                    <span class="album-stats-hero">• ${album.type || 'Album'} • ${album.year || '2024'}</span>
                </div>
                <div class="album-actions-bar">
                    <div class="primary-actions">
                        <button id="ab-play-btn" class="action-btn-large-play">
                            <i class="fa-solid fa-play"></i> <span class="btn-label">Play</span>
                        </button>
                        <button id="ab-shuffle-btn" class="action-btn-large-shuffle">
                            <i class="fa-solid fa-shuffle"></i> <span class="btn-label">Shuffle</span>
                        </button>
                    </div>
                    <div class="secondary-actions">
                        <button id="ab-add-btn" class="action-btn-circle ${library.includes(album.id) ? 'active' : ''}" title="Add to Library">
                            <i class="fa-solid ${library.includes(album.id) ? 'fa-check' : 'fa-plus'}"></i>
                        </button>
                        <button id="ab-download-btn" class="action-btn-circle" title="Download">
                            <i class="fa-solid fa-arrow-down"></i>
                        </button>
                        
                        <button class="action-btn-circle mobile-only"><i class="fa-solid fa-ellipsis"></i></button>
                    </div>
                </div>
                <div class="album-description-hero">
                    One of the most distinctive male voices of contemporary Bollywood, Arijit Singh brings an intimate, husky ti... <span style="color:white; cursor:pointer;">MORE</span>
                </div>
            </div>
        `;
    }
    document.getElementById('album-cover').src = album.cover;
    const tracklist = document.getElementById('tracklist-container');
    tracklist.innerHTML = '';
    // Data Resolution
    let displaySongs = [];
    if (album.songs && album.songs.length > 0) {
        displaySongs = album.songs.map(id => songs.find(s => s.id === id)).filter(s => s);
    } else {
        displaySongs = songs.filter(s => s.album === album.title);
    }
    // === Button Listeners ===
    const playBtn = document.getElementById('ab-play-btn');
    if (playBtn) playBtn.onclick = () => {
        if (displaySongs.length > 0) {
            currentPlaylist = displaySongs;
            currentSongIndex = 0;
            playSong(displaySongs[0]);
        }
    };
    // Shuffle Button Logic
    const shuffleBtn = document.getElementById('ab-shuffle-btn');
    if (shuffleBtn) shuffleBtn.onclick = () => {
        if (displaySongs.length > 0) {
            currentPlaylist = displaySongs;
            isShuffleOn = true;
            // Sync Main Player Shuffle State
            const mainShuf = document.getElementById('shuffle-btn');
            if (mainShuf) {
                mainShuf.classList.add('active');
                mainShuf.style.color = 'var(--primary-color)';
            }
            // Play Random Song
            currentSongIndex = Math.floor(Math.random() * displaySongs.length);
            playSong(displaySongs[currentSongIndex]);
        }
    };
    // Add Button
    const addBtn = document.getElementById('ab-add-btn');
    if (addBtn) addBtn.onclick = () => {
        const index = library.indexOf(album.id);
        if (index > -1) {
            library.splice(index, 1);
            addBtn.classList.remove('active');
            addBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';
        } else {
            library.push(album.id);
            addBtn.classList.add('active');
            addBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
        }
        localStorage.setItem('neonLibrary', JSON.stringify(library));
    };
    displaySongs.forEach((song, index) => {
        const row = document.createElement('div');
        row.className = 'track-item';
        // Highlight active song
        if (String(song.id) === audio.dataset.currentSongId) {
            row.classList.add('active');
        }
        row.innerHTML = `
            <div style="display:flex; align-items:center; gap:20px; flex: 1;">
                <span class="track-number" style="color:#aaa; width:20px;">${index + 1}</span>
                <img src="${song.cover}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;">
                <div style="min-width: 0;">
                   <div class="track-title" style="color:white; font-size:16px; font-weight:500;">${song.title}</div>
                   <div class="track-artist" style="color:#888; font-size:14px;">${song.artist}</div>
                </div>
            </div>
            <button class="like-btn ${isLiked(song.id) ? 'liked' : ''}" data-id="${song.id}" style="background:none; border:none; color:${isLiked(song.id) ? '#1db954' : '#b3b3b3'}; cursor:pointer; margin-right: 20px; font-size: 16px;">
                ${isLiked(song.id) ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>'}
            </button>
            <span class="desktop-only" style="color:#888; font-size:14px;">${song.duration}</span>
            <button class="mobile-dots-btn mobile-only"><i class="fa-solid fa-ellipsis-vertical"></i></button>
        `;
        // Add listeners
        const dotsBtn = row.querySelector('.mobile-dots-btn');
        if (dotsBtn) {
            dotsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openMobileMenu(song);
            });
        }
        const likeBtn = row.querySelector('.like-btn');
        likeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLike(song);
            const liked = isLiked(song.id);
            likeBtn.innerHTML = liked ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>';
            likeBtn.style.color = liked ? '#1db954' : '#b3b3b3';
            if (liked) likeBtn.classList.add('liked'); else likeBtn.classList.remove('liked');
        });
        row.addEventListener('click', (e) => {
            if (e.target.closest('.like-btn')) return;
            currentPlaylist = displaySongs;
            currentSongIndex = index;
            playSong(song);
        });
        tracklist.appendChild(row);
    });
    // =========================================
    // 📊 ALBUM STATS & FEATURED ARTISTS (Mobile)
    // =========================================
    // 1. Calculate Duration
    const totalDurationSeconds = displaySongs.reduce((acc, song) => {
        const parts = song.duration.split(':').map(Number);
        const seconds = parts.length === 2 ? parts[0] * 60 + parts[1] : 0;
        return acc + seconds;
    }, 0);
    const hours = Math.floor(totalDurationSeconds / 3600);
    const minutes = Math.floor((totalDurationSeconds % 3600) / 60);
    const durationText = hours > 0 ? `${hours} hours ${minutes} minutes` : `${minutes} minutes`;
    const statsDiv = document.createElement('div');
    statsDiv.className = 'album-stats-footer mobile-only';
    statsDiv.innerText = `${displaySongs.length} songs, ${durationText}`;
    tracklist.appendChild(statsDiv);
    // 2. Featured Artists
    // Extract artists from song artist strings, exclude main album artist
    const mainArtist = album.artist.toLowerCase();
    const featuredSet = new Set();
    displaySongs.forEach(song => {
        // Split by ',' or '&'
        const names = song.artist.split(/,|&/).map(n => n.trim());
        names.forEach(name => {
            if (name.toLowerCase() !== mainArtist && name.length > 0) {
                featuredSet.add(name);
            }
        });
    });
    if (featuredSet.size > 0) {
        const featuredContainer = document.createElement('div');
        featuredContainer.className = 'featured-artists-section mobile-only';
        let carouselHTML = `
            <h3 class="featured-title">Featured Artists <i class="fa-solid fa-chevron-right" style="font-size: 12px;"></i></h3>
            <div class="featured-artists-carousel">
        `;
        featuredSet.forEach(name => {
            // Find image if exists in global artists array, else generic
            const artistObj = artists.find(a => a.name.toLowerCase() === name.toLowerCase());
            // Use artist image or random one from unsplash source if quick match fails
            // For now, let's try to map or use a placeholder that looks nice
            const img = artistObj ? artistObj.image : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
            carouselHTML += `
                <div class="artist-circle-item">
                    <img src="${img}" class="artist-circle-img">
                    <span class="artist-circle-name">${name}</span>
                </div>
            `;
        });
        carouselHTML += `</div>`;
        featuredContainer.innerHTML = carouselHTML;
        tracklist.appendChild(featuredContainer);
    }
}
function openDeepDivePage(data) {
    showView('album'); // Reuse album view container
    // Custom Header for Deep Dive
    const metaContainer = document.querySelector('#album-view .album-info-hero');
    // Resolve Songs first so it is available for header and tracklist
    let displaySongs = [];
    if (data.songs && data.songs.length > 0) {
        displaySongs = data.songs.map(id => songs.find(s => s.id === id)).filter(s => s);
    }
    if (metaContainer) {
        metaContainer.innerHTML = `
            <div style="display:flex; flex-direction:column; justify-content:flex-end; height:100%;">
                <h5 style="color: var(--primary-color); letter-spacing: 2px; font-weight:bold; margin-bottom:10px;">${data.type.toUpperCase()}</h5>
                <h1 style="font-size: 64px; margin: 0 0 20px 0; line-height:1;">${data.title}</h1>
                <p style="color: #ccc; font-size: 16px; margin-bottom: 20px;">${data.desc}</p>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                    <img src="https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;">
                    <span style="font-weight: bold;">${data.artist}</span>
                    <span style="color: #ccc;">• ${data.songs ? data.songs.length : 0} songs</span>
                </div>
                
                <div class="action-bar" style="display: flex; align-items: center; gap: 24px;">
                    <button id="dd-play-btn" class="action-btn-play" 
                        style="width: 56px; height: 56px; border-radius: 50%; background: #1db954; color: black; border: none; font-size: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s;">
                        <i class="fa-solid fa-play"></i>
                    </button>
                    <button id="dd-enhance-btn" title="Enhance"
                        style="background: none; border: 1px solid #727272; color: #fff; border-radius: 20px; padding: 5px 15px; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 5px; height: 32px; transition: all 0.2s;">
                        <i class="fa-solid fa-wand-magic-sparkles"></i>
                    </button>
                    <button id="dd-shuffle-btn" title="Shuffle"
                        style="background: none; border: none; color: ${isShuffleOn ? 'var(--primary-color)' : '#b3b3b3'}; font-size: 24px; cursor: pointer; transition: color 0.2s;">
                        <i class="fa-solid fa-shuffle"></i>
                    </button>
                    <button id="dd-add-btn" title="Add to Library"
                        style="background: none; border: 2px solid ${library.includes(data.id) ? 'var(--primary-color)' : '#b3b3b3'}; color: ${library.includes(data.id) ? 'var(--primary-color)' : '#b3b3b3'}; width: 32px; height: 32px; border-radius: 50%; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
                        <i class="fa-solid ${library.includes(data.id) ? 'fa-check' : 'fa-plus'}"></i>
                    </button>
                    <button id="dd-download-btn" title="Download"
                        style="background: none; border: 2px solid #b3b3b3; color: #b3b3b3; width: 32px; height: 32px; border-radius: 50%; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
                        <i class="fa-solid fa-arrow-down"></i>
                    </button>
                    
                    <button style="background: none; border: none; color: #b3b3b3; font-size: 24px; cursor: pointer;"><i class="fa-solid fa-ellipsis"></i></button>
                </div>
            </div>
        `;
        // === Button Logic ===
        // Play Button
        const playBtn = document.getElementById('dd-play-btn');
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                if (displaySongs.length > 0) {
                    currentPlaylist = displaySongs;
                    currentSongIndex = 0;
                    playSong(displaySongs[0]); // Plays first song
                }
            });
        }
        // Shuffle Button
        const shuffleBtn = document.getElementById('dd-shuffle-btn');
        if (shuffleBtn) {
            shuffleBtn.addEventListener('click', () => {
                isShuffleOn = !isShuffleOn;
                shuffleBtn.style.color = isShuffleOn ? 'var(--primary-color)' : '#b3b3b3';
                // Also update global shuffle button state if visible elsewhere
                const mainShuffle = document.getElementById('shuffle-btn');
                if (mainShuffle) {
                    mainShuffle.classList.toggle('active', isShuffleOn);
                    mainShuffle.style.color = isShuffleOn ? 'var(--primary-color)' : '#b3b3b3';
                }
            });
        }
        // Add Button
        const addBtn = document.getElementById('dd-add-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const index = library.indexOf(data.id);
                if (index > -1) {
                    library.splice(index, 1); // Remove
                    addBtn.style.color = '#b3b3b3';
                    addBtn.style.borderColor = '#b3b3b3';
                    addBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';
                } else {
                    library.push(data.id); // Add
                    addBtn.style.color = 'var(--primary-color)';
                    addBtn.style.borderColor = 'var(--primary-color)';
                    addBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
                    // Optional: If user is viewing library, refresh it? 
                    // Not needed right now as we are in Album view.
                }
                localStorage.setItem('neonLibrary', JSON.stringify(library));
            });
        }
        // Download Button
        const dlBtn = document.getElementById('dd-download-btn');
        if (dlBtn) {
            dlBtn.addEventListener('click', () => {
                if (dlBtn.innerHTML.includes('fa-check')) return; // Already downloaded
                const originalIcon = dlBtn.innerHTML;
                dlBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
                dlBtn.style.color = 'var(--primary-color)';
                dlBtn.style.borderColor = 'var(--primary-color)';
                setTimeout(() => {
                    dlBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
                    // Reset after 2s or keep checked? User implies persistent state or just visual feedback.
                    // "When downloaded" usually implies persistent. Let's keep it checked for session.
                }, 1500);
            });
        }
    }
    // Set Cover (Video thumbnail or placeholder)
    document.getElementById('album-cover').src = "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop";
    const tracklist = document.getElementById('tracklist-container');
    tracklist.innerHTML = '';
    // Song list already resolved above for play button
    if (displaySongs.length === 0) {
        tracklist.innerHTML = '<div style="padding: 20px; color: #888;">No tracks available for this section.</div>';
        return;
    }
    displaySongs.forEach((song, index) => {
        const row = document.createElement('div');
        row.className = 'track-item';
        row.innerHTML = `
            <div style="display:flex; align-items:center; gap:20px; flex: 1;">
                <span class="track-number" style="color:#aaa; width:20px;">${index + 1}</span>
                <img src="${song.cover}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;">
                <div>
                   <div style="color:white; font-size:16px; font-weight:500;">${song.title}</div>
                   <div style="color:#888; font-size:14px;">${song.artist}</div>
                </div>
            </div>
            <button class="like-btn ${isLiked(song.id) ? 'liked' : ''}" data-id="${song.id}" style="background:none; border:none; color:${isLiked(song.id) ? '#1db954' : '#b3b3b3'}; cursor:pointer; margin-right: 20px; font-size: 16px;">
                ${isLiked(song.id) ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>'}
            </button>
            <span class="desktop-only" style="color:#888; font-size:14px;">${song.duration}</span>
            <button class="mobile-dots-btn mobile-only"><i class="fa-solid fa-ellipsis-vertical"></i></button>
        `;
        // Listeners
        const likeBtn = row.querySelector('.like-btn');
        likeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLike(song);
            const liked = isLiked(song.id);
            // Update color and icon
            likeBtn.innerHTML = liked ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>';
            likeBtn.style.color = liked ? '#1db954' : '#b3b3b3';
            // Update class for visibility
            if (liked) likeBtn.classList.add('liked');
            else likeBtn.classList.remove('liked');
        });
        row.addEventListener('click', (e) => {
            if (e.target.closest('.like-btn')) return;
            currentPlaylist = displaySongs;
            currentSongIndex = index;
            playSong(song);
        });
        tracklist.appendChild(row);
    });
}
function playSong(song) {
    audio.src = song.src;
    audio.dataset.currentSongId = song.id;
    const knownIndex = currentPlaylist.findIndex(s => s.id === song.id);
    if (knownIndex !== -1) {
        currentSongIndex = knownIndex;
    } else {
        currentPlaylist = [song];
        currentSongIndex = 0;
    }
    // Media Session
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.title || 'Unknown Title',
            artist: song.artist || 'Unknown Artist',
            album: song.album || 'Neon Music',
            artwork: [
                {
                    src: song.cover || song.image || 'default-cover.png',
                    sizes: '512x512',
                    type: 'image/jpeg'
                }
            ]
        });
    }
    audio.play()
        .then(() => {
            updatePlayButton();
            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = "playing";
            }
        })
        .catch(error => {
            console.error("Playback failed:", error);
        });
    updatePlayerUI(song);
    savePlayerState();
    addToRecentlyPlayed(song);
    const sidebar = document.getElementById('right-sidebar');
    if (sidebar && sidebar.classList.contains('collapsed')) {
        sidebar.classList.remove('collapsed');
    }
    if (window.Visualizer) {
        window.Visualizer.setMode(song.genre);
    }
    // Explicitly set media session playback state
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
    }
}
function togglePlay() {
    if (!audio.src) return;
    if (audio.paused) {
        audio.play().then(() => {
            if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
        }).catch(err => console.log(err));
    } else {
        audio.pause();
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
    }
}
function updatePlayButton() {
    const miniBtn = document.getElementById('mini-play-btn');
    const mobilePlayBtn = document.getElementById('mobile-play-btn');
    const rsVideo = document.getElementById('rs-loop-video');
    const playing = !audio.paused;   // 🔥 REAL STATE
    // Main Player
    if (player.playBtn) {
        player.playBtn.innerHTML = playing
            ? '<i class="fa-solid fa-pause"></i>'
            : '<i class="fa-solid fa-play"></i>';
    }
    // Mini Player
    if (miniBtn) {
        miniBtn.innerHTML = playing
            ? '<i class="fa-solid fa-pause"></i>'
            : '<i class="fa-solid fa-play"></i>';
    }
    // Mobile Button
    if (mobilePlayBtn) {
        mobilePlayBtn.innerHTML = playing
            ? '<i class="fa-solid fa-pause"></i>'
            : '<i class="fa-solid fa-play"></i>';
    }
    // Video Sync
    if (player.video) {
        playing
            ? player.video.play().catch(() => { })
            : player.video.pause();
    }
    if (rsVideo) {
        if (!document.hidden) {
            playing
                ? rsVideo.play().catch(() => { })
                : rsVideo.pause();
        }
    }
}
// Update Player and Right Side Canvas
// Update Player and Right Side Canvas
// Update Player and Right Side Canvas
function updatePlayerUI(song) {
    updateMobilePlayerUI(song);
    if (player.title) player.title.innerText = song.title;
    if (player.artist) player.artist.innerText = song.artist;
    // Right Side Canvas Updates
    const rsVideo = document.getElementById('rs-loop-video');
    const rsTitle = document.getElementById('rs-title');
    const rsArtist = document.getElementById('rs-artist');
    const rsAboutImg = document.getElementById('rs-about-img');
    const rsListeners = document.getElementById('rs-listeners');
    const rsBio = document.getElementById('rs-bio');
    const rsCredits = document.getElementById('rs-credits-list');
    // Mini Player Updates
    const miniCover = document.getElementById('mini-cover');
    const miniTitle = document.querySelector('.mini-title');
    const miniArtist = document.querySelector('.mini-artist');
    const miniInfo = document.querySelector('.mini-info');
    const miniAddBtn = document.getElementById('mini-add-btn');
    // Ensure elements exist before trying to update
    if (miniCover && song.cover) {
        miniCover.src = song.cover;
        miniCover.style.opacity = '1';
        miniCover.style.display = 'block';
    }
    if (miniTitle && miniInfo) {
        miniTitle.innerText = song.title;
        miniInfo.style.opacity = '1';
        miniInfo.style.display = 'flex';
    }
    if (miniArtist) {
        miniArtist.innerText = song.artist || 'Unknown Artist';
        miniArtist.classList.add('artist-link'); // Add link class
        miniArtist.style.cursor = 'pointer';
        miniArtist.style.textDecoration = 'underline'; // Optional visual cue
        miniArtist.onclick = (e) => {
            e.stopPropagation();
            openArtistPage(song.artist);
        }
    }
    // Add to library button (Simple toggle for now)
    if (miniAddBtn) {
        miniAddBtn.onclick = (e) => {
            e.stopPropagation();
            miniAddBtn.classList.toggle('added');
            const icon = miniAddBtn.querySelector('i');
            if (icon) {
                if (miniAddBtn.classList.contains('added')) {
                    icon.classList.remove('fa-regular');
                    icon.classList.add('fa-solid');
                    icon.style.color = 'var(--primary-color)';
                } else {
                    icon.classList.remove('fa-solid');
                    icon.classList.add('fa-regular');
                    icon.style.color = '#b3b3b3';
                }
            }
        };
    }
    // About Section & Right Sidebar
    if (rsVideo && song.video) {
        rsVideo.src = song.video;
        // Only play video if app is visible
        if (!document.hidden) {
            rsVideo.play().catch(() => { });
        }
    }
    if (rsTitle) rsTitle.innerText = song.title;
    if (rsArtist) rsArtist.innerText = song.artist;
    // Find rich artist data
    const artistData = artists.find(a => a.name === song.artist);
    if (artistData) {
        if (rsAboutImg) rsAboutImg.src = artistData.aboutImage || artistData.image;
        if (rsListeners) rsListeners.innerText = `${artistData.listeners || '10,000'} monthly listeners`;
        if (rsBio) rsBio.innerText = artistData.bio || 'Artist bio not available.';
        // Mock credits based on artist
        if (rsCredits) {
            rsCredits.innerHTML = `
                    <div class="rs-credit-item">
                        <div>
                            <div class="rs-credit-role">${artistData.name}</div>
                            <div class="rs-credit-name">Main Artist</div>
                        </div>
                        <button class="rs-follow-btn">Follow</button>
                    </div>
                    <div class="rs-credit-item">
                        <div>
                            <div class="rs-credit-role">Neon Producer</div>
                            <div class="rs-credit-name">Producer</div>
                        </div>
                        <button class="rs-follow-btn">Follow</button>
                    </div>
                    <div class="rs-credit-item">
                        <div>
                            <div class="rs-credit-role">Retro Writer</div>
                            <div class="rs-credit-name">Composer</div>
                        </div>
                    </div>
                `;
        }
    }
}
// Redundant old Mobile Player logic removed. New logic located at bottom of file.
function updateProgress() {
    const { currentTime, duration } = audio;
    const progressPercent = (currentTime / duration) * 100;
    player.progressFill.style.width = `${progressPercent}%`;
    player.currTime.innerText = formatTime(currentTime);
    // Mobile Progress
    if (typeof updateMobileProgress === 'function') {
        updateMobileProgress();
    }
    if (typeof updateMiniPlayerProgress === 'function') {
        updateMiniPlayerProgress(currentTime, duration);
    }
    // Sync lyrics
    if (typeof syncLyrics === 'function') {
        syncLyrics(currentTime);
    }
}
function formatTime(time) {
    if (isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}
// Playback Logic helpers
let isShuffleOn = false;
function playNext() {
    // If we have a playlist context
    if (currentPlaylist.length > 0) {
        if (isShuffleOn) {
            // Pick random index
            let newIndex = Math.floor(Math.random() * currentPlaylist.length);
            // Optional: avoid playing strictly the same song if list > 1
            if (currentPlaylist.length > 1 && newIndex === currentSongIndex) {
                newIndex = (newIndex + 1) % currentPlaylist.length;
            }
            currentSongIndex = newIndex;
        } else {
            currentSongIndex = (currentSongIndex + 1) % currentPlaylist.length;
        }
        playSong(currentPlaylist[currentSongIndex]);
    }
}
function playPrev() {
    if (currentPlaylist.length > 0) {
        currentSongIndex = (currentSongIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
        playSong(currentPlaylist[currentSongIndex]);
    }
}
// Search Logic
// Search Logic - Overlay Version
function openSearchOverlay() {
    const overlay = document.getElementById('search-overlay');
    const input = document.getElementById('overlay-search-input');
    if (overlay) {
        overlay.style.display = 'flex';
        renderOverlayRecentSearches();
        if (input) input.focus();
    }
}
function closeSearchOverlay() {
    const overlay = document.getElementById('search-overlay');
    if (overlay) overlay.style.display = 'none';
    // Optional: Clear input or reset view?? Matches spotify behavior to keep state or reset?
    // Let's keep it simple.
}
function handleOverlaySearch(query) {
    const recentContainer = document.getElementById('overlay-recent-container');
    const resultsContainer = document.getElementById('overlay-results-container');
    const grid = document.getElementById('overlay-results-grid');
    if (!query || query.trim() === '') {
        // Show Recent
        if (recentContainer) recentContainer.style.display = 'block';
        if (resultsContainer) resultsContainer.style.display = 'none';
        renderOverlayRecentSearches();
        return;
    }
    // Show Results
    if (recentContainer) recentContainer.style.display = 'none';
    if (resultsContainer) resultsContainer.style.display = 'block';
    grid.innerHTML = '';
    const results = songs.filter(s =>
        s.title.toLowerCase().includes(query) ||
        s.artist.toLowerCase().includes(query) ||
        (s.album && s.album.toLowerCase().includes(query))
    );
    if (results.length === 0) {
        grid.innerHTML = '<div style="color:#888; padding:20px;">No results found</div>';
        return;
    }
    results.forEach(song => {
        // Create List Row for Mobile Overlay results
        const div = document.createElement('div');
        div.className = 'search-result-row'; // New class for results
        div.innerHTML = `
            <div class="recent-img-container ${song.type === 'Artist' ? 'round' : ''}">
                <img src="${song.cover || song.image}" class="recent-img">
            </div>
            <div class="recent-info">
                <div class="recent-title" style="${song.id === ((window.audio && window.audio.dataset.currentSongId) ? 'color:#1db954;' : '')}">${song.title || song.name}</div>
                <div class="recent-subtitle">${song.type || 'Song'} ${song.artist ? '• ' + song.artist : ''}</div>
            </div>
            <div class="search-item-dots"><i class="fa-solid fa-ellipsis-vertical"></i></div>
        `;
        div.addEventListener('click', (e) => {
            // Logic for dots if needed later
            if (e.target.closest('.search-item-dots')) {
                e.stopPropagation();
                // Context menu or action
                return;
            }
            addToRecent(song);
            if (song.type === 'Song' || !song.type) {
                playSong(song);
                // Optionally close overlay? Or keep open? Spotify keeps open.
            } else if (song.type === 'Artist') {
                openArtistPage(song.name);
                closeSearchOverlay();
            } else if (song.type === 'Album') {
                openAlbum(song);
                closeSearchOverlay();
            }
        });
        grid.appendChild(div);
    });
}
function renderOverlayRecentSearches() {
    const list = document.getElementById('overlay-recent-list');
    if (!list) return; // Guard
    if (recentSearches.length === 0) {
        list.innerHTML = '<div style="color:#666; font-size:14px; padding:10px 0;">No recent searches</div>';
        return;
    }
    list.innerHTML = '';
    recentSearches.slice(0, 10).forEach(item => {
        const div = document.createElement('div');
        div.className = 'recent-search-item';
        div.innerHTML = `
            <div class="recent-img-container ${item.type === 'Artist' ? 'round' : ''}">
                <img src="${item.cover || item.image}" class="recent-img">
            </div>
            <div class="recent-info">
                <div class="recent-title" style="${item.id === ((window.audio && window.audio.dataset.currentSongId) ? 'color:#1db954;' : '')}">${item.title || item.name}</div>
                <div class="recent-subtitle">${item.type || 'Song'} ${item.artist ? '• ' + item.artist : ''}</div>
            </div>
            <button class="recent-item-remove"><i class="fa-solid fa-xmark"></i></button>
        `;
        div.addEventListener('click', (e) => {
            if (e.target.closest('.recent-item-remove')) {
                e.stopPropagation();
                removeFromRecent(item.id);
                return;
            }
            if (item.type === 'Song' || !item.type) {
                playSong(item);
            } else if (item.type === 'Artist') {
                openArtistPage(item.name);
                closeSearchOverlay();
            } else if (item.type === 'Album') {
                openAlbum(item);
                closeSearchOverlay();
            }
        });
        list.appendChild(div);
    });
}
// Reuse addToRecent/removeFromRecent from before... or ensure they update overlay
function addToRecent(item) {
    // Remove if exists (to bump to top)
    const index = recentSearches.findIndex(i => i.id === item.id);
    if (index > -1) {
        recentSearches.splice(index, 1);
    }
    // Add to front
    // Normalize data slightly to ensure we have what we need
    const recentItem = {
        id: item.id,
        title: item.title || item.name,
        artist: item.artist,
        cover: item.cover || item.image,
        type: item.type || (item.name ? 'Artist' : 'Song') // Basic inference
    };
    recentSearches.unshift(recentItem);
    // Limit to 10
    if (recentSearches.length > 20) recentSearches.pop();
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    // Refresh Overlay
    renderOverlayRecentSearches();
}
function removeFromRecent(id) {
    const index = recentSearches.findIndex(i => i.id === id);
    if (index > -1) {
        recentSearches.splice(index, 1);
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
        renderOverlayRecentSearches();
    }
}
function clearRecent() {
    recentSearches = [];
    localStorage.removeItem('recentSearches');
    renderOverlayRecentSearches();
}
// === Context Menu Logic ===
document.addEventListener('click', (e) => {
    const menu = document.getElementById('context-menu');
    if (menu && !menu.contains(e.target)) {
        menu.style.display = 'none';
        menu.classList.remove('active');
    }
});
function toggleLibrary(id) {
    const index = library.indexOf(id);
    if (index > -1) {
        library.splice(index, 1);
    } else {
        library.push(id);
    }
    localStorage.setItem('neonLibrary', JSON.stringify(library));
    // Refresh if in library view
    if (document.getElementById('dashboard-title').innerText === 'Recently Added' && currentView === 'dashboard') {
        showLibrary('recent');
    }
}
function showContextMenu(e, item, type) {
    if (type !== 'album') return; // Only albums for now
    e.stopPropagation();
    e.preventDefault();
    const existing = document.getElementById('context-menu');
    if (existing) existing.remove();
    const menu = document.createElement('div');
    menu.id = 'context-menu';
    menu.className = 'context-menu active';
    const isInLib = library.includes(item.id);
    const libAction = isInLib ? 'Remove from Library' : 'Add to Library';
    const libIcon = isInLib ? 'fa-minus' : 'fa-plus';
    menu.innerHTML = `
        <div class="context-menu-item" id="ctx-lib">
            <i class="fa-solid ${libIcon}"></i> ${libAction}
        </div>
        <div class="context-menu-item" id="ctx-pl">
            <i class="fa-solid fa-list"></i> Add to Playlist
        </div>
    `;
    document.body.appendChild(menu);
    const x = e.pageX;
    const y = e.pageY;
    // Boundary check (simple)
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.querySelector('#ctx-lib').addEventListener('click', () => {
        toggleLibrary(item.id);
        menu.remove();
    });
    menu.querySelector('#ctx-pl').addEventListener('click', () => {
        // Trigger playlist dialog (Stub)
        document.getElementById('playlist-dialog').style.display = 'flex';
        menu.remove();
    });
}
// Artist Page Logic
function openArtistPage(artistName) {
    const artist = artists.find(a => a.name === artistName);
    if (!artist) return;
    showView('artist');
    // Update Header
    const hero = document.getElementById('artist-hero');
    const name = document.getElementById('artist-name-large');
    const listeners = document.getElementById('artist-listeners-large');
    hero.style.backgroundImage = `url('${artist.aboutImage || artist.image}')`;
    name.innerText = artist.name;
    listeners.innerText = `${artist.listeners} monthly listeners`;
    // Populate Tracks
    const tracklist = document.getElementById('artist-tracklist');
    tracklist.innerHTML = '';
    const artistSongs = songs.filter(s => s.artist === artist.name);
    // Play Button Logic
    const playButton = document.getElementById('artist-play-btn');
    if (playButton) {
        const newBtn = playButton.cloneNode(true);
        playButton.parentNode.replaceChild(newBtn, playButton);
        newBtn.addEventListener('click', () => {
            if (artistSongs.length > 0) {
                currentPlaylist = artistSongs;
                currentSongIndex = 0;
                playSong(artistSongs[0]);
            }
        });
    }
    // Shuffle Button Logic
    const shuffleBtn = document.getElementById('artist-shuffle-btn');
    if (shuffleBtn) {
        const newShuffle = shuffleBtn.cloneNode(true);
        shuffleBtn.parentNode.replaceChild(newShuffle, shuffleBtn);
        // Init visual state
        newShuffle.style.color = isShuffleOn ? '#1db954' : '#b3b3b3';
        newShuffle.querySelector('i').className = 'fa-solid fa-shuffle';
        newShuffle.addEventListener('click', () => {
            isShuffleOn = !isShuffleOn;
            newShuffle.style.color = isShuffleOn ? '#1db954' : '#b3b3b3';
        });
    }
    // Add to Library Button Logic
    const addBtn = document.getElementById('artist-add-btn');
    if (addBtn) {
        const newAdd = addBtn.cloneNode(true);
        addBtn.parentNode.replaceChild(newAdd, addBtn);
        let isAdded = false;
        newAdd.addEventListener('click', () => {
            isAdded = !isAdded;
            const icon = newAdd.querySelector('i');
            if (isAdded) {
                icon.className = 'fa-solid fa-check';
                newAdd.style.color = '#1db954';
                newAdd.style.borderColor = '#1db954';
            } else {
                icon.className = 'fa-solid fa-plus';
                newAdd.style.color = '#b3b3b3';
                newAdd.style.borderColor = '#b3b3b3';
            }
        });
    }
    // Download Button Logic
    const dlBtn = document.getElementById('artist-download-btn');
    if (dlBtn) {
        const newDl = dlBtn.cloneNode(true);
        dlBtn.parentNode.replaceChild(newDl, dlBtn);
        newDl.addEventListener('click', () => {
            if (artistSongs.length === 0) return;
            // Visual feedback
            const originalIcon = newDl.innerHTML;
            newDl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            newDl.style.color = '#1db954';
            newDl.style.borderColor = '#1db954';
            setTimeout(() => {
                newDl.innerHTML = '<i class="fa-solid fa-check"></i>';
                // Reset after 2s
                setTimeout(() => {
                    newDl.innerHTML = originalIcon;
                    newDl.style.color = '#b3b3b3';
                    newDl.style.borderColor = '#b3b3b3';
                }, 2000);
            }, 1500);
        });
    }
    artistSongs.forEach((song, index) => {
        const row = document.createElement('div');
        row.className = 'track-item';
        // Highlight currently playing song
        if (String(song.id) === audio.dataset.currentSongId) {
            row.classList.add('active');
        }
        row.innerHTML = `
            <div style="display:flex; align-items:center; gap: 15px; flex: 1;">
                <div class="track-number" style="color: #b3b3b3; font-size: 16px; width: 20px;">${index + 1}</div>
                <img src="${song.cover}" style="width: 40px; height: 40px; border-radius: 4px;">
                <div style="display: flex; flex-direction: column;">
                    <span style="color: white; font-size: 15px;">${song.title}</span>
                </div>
            </div>
            <button class="like-btn" data-id="${song.id}" style="background:none; border:none; color:${isLiked(song.id) ? '#1db954' : '#b3b3b3'}; cursor:pointer; margin-right: 20px; font-size: 16px;">
                ${isLiked(song.id) ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>'}
            </button>
            <div style="color: #b3b3b3; font-size: 14px; margin-right: 40px;">${song.listeners || '1,000,000'}</div> 
            <div style="color: #b3b3b3; font-size: 14px;">${song.duration}</div>
        `;
        // Add listeners
        const likeBtn = row.querySelector('.like-btn');
        likeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLike(song);
        });
        row.addEventListener('click', (e) => {
            if (e.target.closest('.like-btn')) return;
            currentPlaylist = artistSongs;
            currentSongIndex = index;
            playSong(song);
        });
        tracklist.appendChild(row);
    });
}
// Player Persistence
function savePlayerState() {
    if (!currentPlaylist || currentPlaylist.length === 0) return;
    const state = {
        songId: currentPlaylist[currentSongIndex].id
    };
    localStorage.setItem('neonPlayerState', JSON.stringify(state));
}
function loadPlayerState() {
    const saved = localStorage.getItem('neonPlayerState');
    if (!saved) return;
    try {
        const state = JSON.parse(saved);
        if (!state.songId) return;
        const song = songs.find(s => s.id === state.songId);
        if (!song) return;
        currentPlaylist = songs;
        currentSongIndex = songs.findIndex(s => s.id === song.id);
        audio.src = song.src;
        audio.dataset.currentSongId = song.id;
        updatePlayerUI(song);
        updatePlayButton();
    } catch (e) {
        console.error('Failed to load player state', e);
    }
}
// Render Liked Songs
// Render Liked Songs (Grouped by Album)
// Render Liked Songs (Flat Track List)
function renderLikedSongs() {
    showView('liked');
    currentView = 'liked';
    const container = document.getElementById('liked-tracklist-container');
    const countEl = document.getElementById('liked-songs-count');
    const playBtn = document.getElementById('play-liked-btn');
    // Show play button for the list
    if (playBtn) {
        playBtn.style.display = 'flex';
        playBtn.onclick = () => {
            if (likedSongs.length > 0) {
                currentPlaylist = likedSongs;
                currentSongIndex = 0;
                playSong(likedSongs[0]);
            }
        };
    }
    if (!container || !countEl) return;
    container.innerHTML = '';
    // Reset container layout to block for list
    container.style.display = 'block';
    container.style.marginTop = '0'; // Reset any grid margins
    countEl.innerText = `${likedSongs.length} songs`;
    if (likedSongs.length === 0) {
        container.innerHTML = '<div style="color:#888; text-align:center; padding: 40px;">You haven\'t liked any songs yet. Tap the heart icon on any track!</div>';
        return;
    }
    likedSongs.forEach((song, index) => {
        const row = document.createElement('div');
        row.className = 'track-item';
        row.innerHTML = `
            <div style="display:flex; align-items:center; gap:20px; flex: 1;">
                <span class="track-number" style="color:#aaa; width:20px;">${index + 1}</span>
                <img src="${song.cover}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;">
                <div>
                   <div style="color:white; font-size:16px; font-weight:500;">${song.title}</div>
                   <div style="color:#888; font-size:14px;">${song.artist}</div>
                </div>
            </div>
            
            <div style="display:flex; align-items:center;">
                <span style="color:#888; font-size:14px; margin-right: 20px;">${song.album || 'Single'}</span>
                
                <button class="like-btn liked" data-id="${song.id}" style="background:none; border:none; color:#1db954; cursor:pointer; margin-right: 20px; font-size: 16px;">
                    <i class="fa-solid fa-heart"></i>
                </button>
                
                <span style="color:#888; font-size:14px; width: 40px; text-align: right;">${song.duration}</span>
                <button class="track-menu-btn" style="background:none; border:none; color:#b3b3b3; cursor:pointer; margin-left: 10px;"><i class="fa-solid fa-ellipsis"></i></button>
            </div>
        `;
        // Add listeners
        const likeBtn = row.querySelector('.like-btn');
        likeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLike(song);
            renderLikedSongs(); // Re-render to remove
        });
        row.addEventListener('click', (e) => {
            if (e.target.closest('.like-btn') || e.target.closest('.track-menu-btn')) return;
            currentPlaylist = likedSongs;
            currentSongIndex = index;
            playSong(song);
        });
        container.appendChild(row);
    });
}
// Global click handler for artist names
document.addEventListener('click', (e) => {
    // Check if clicked element is an artist name/link
    if (e.target.closest('.artist-link') || e.target.classList.contains('artist-link')) {
        const link = e.target.closest('.artist-link') || e.target;
        const name = link.innerText;
        openArtistPage(name);
    }
});
// Save state events
window.addEventListener('beforeunload', savePlayerState);
audio.addEventListener('pause', savePlayerState);
// Throttle save during playback (every 2s)
let lastSave = 0;
audio.addEventListener('timeupdate', () => {
    const now = Date.now();
    if (now - lastSave > 2000) {
        savePlayerState();
        lastSave = now;
    }
});
document.addEventListener('visibilitychange', () => {
    if (document.hidden) savePlayerState();
});
// Start
// Visualizer Module
const Visualizer = {
    canvas: document.getElementById('bg-visualizer'),
    ctx: null,
    audioContext: null,
    source: null,
    analyser: null,
    dataArray: null,
    animationId: null,
    mode: 'EDM',
    // Galaxy Theme Backgrounds (Cloud Source)
    bgImages: {
        'EDM': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop', // Deep Earth/Space
        'Lo-fi': 'https://images.unsplash.com/photo-1614730341194-75c60740a2d3?q=80&w=1974&auto=format&fit=crop', // Purple Planet
        'Classical': 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2011&auto=format&fit=crop', // Milky Way Stars
        'Rock': 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=2070&auto=format&fit=crop', // Neon Burst
        'Happy': 'https://images.unsplash.com/photo-1533292686609-dd188d11dd49?q=80&w=2071&auto=format&fit=crop' // Golden Lights
    },
    loadedImages: {},
    init() {
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        // Preload Images
        Object.keys(this.bgImages).forEach(key => {
            const img = new Image();
            img.src = this.bgImages[key];
            this.loadedImages[key] = img;
        });
        // Initial black screen
        this.ctx.fillStyle = '#050505';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // Render Deep Dives Section
        this.renderDeepDives();
    },
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },
    setupAudio() {
        if (this.audioContext) {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            return;
        }
        // Create context on user gesture
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            // Connect existing audio element
            // Handle CORS issues gracefully
            try {
                console.log('Web Audio API hook disabled to ensure playback stability.');
            } catch (mediaError) {
                console.warn('CORS or MediaSource error. Visualizer will run in fallback mode.', mediaError);
            }
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            console.log('AudioContext initialized');
            this.animate();
        } catch (e) {
            console.error('AudioContext setup failed:', e);
        }
    },
    setMode(genre) {
        this.mode = genre || 'EDM';
        console.log('Visualizer mode:', this.mode);
        this.particles = [];
        if (this.mode === 'Classical') {
            for (let i = 0; i < 100; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    size: Math.random() * 2,
                    speed: Math.random() * 0.5
                });
            }
        } else if (this.mode === 'Lo-fi') {
            for (let i = 0; i < 50; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    len: Math.random() * 20 + 10,
                    speed: Math.random() * 5 + 5
                });
            }
        }
    },
    getBass() {
        if (!this.analyser) {
            // Fallback simulation: Pulse with time
            return 128 + Math.sin(Date.now() / 200) * 50;
        }
        this.analyser.getByteFrequencyData(this.dataArray);
        let sum = 0;
        for (let i = 0; i < 10; i++) sum += this.dataArray[i];
        // If silence (CORS issue), return simulation
        let val = sum / 10;
        if (val === 0) return 128 + Math.sin(Date.now() / 200) * 50;
        return val;
    },
    getTreble() {
        if (!this.analyser) {
            // Fallback simulation
            return 100 + Math.cos(Date.now() / 150) * 30;
        }
        let sum = 0;
        const start = Math.floor(this.analyser.frequencyBinCount * 0.7);
        for (let i = start; i < this.analyser.frequencyBinCount; i++) sum += this.dataArray[i];
        // If silence, return simulation
        let val = sum / (this.analyser.frequencyBinCount - start);
        if (val === 0) return 100 + Math.cos(Date.now() / 150) * 30;
        return val;
    },
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        if (!this.ctx) return;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const bass = this.getBass();
        const treble = this.getTreble();
        // Draw Background Image
        const img = this.loadedImages[this.mode] || this.loadedImages['EDM'];
        if (img) {
            // Static "Cover" fit
            const imgAspect = img.width / img.height;
            const canvasAspect = w / h;
            let dw, dh, dx, dy;
            if (canvasAspect > imgAspect) {
                dw = w;
                dh = w / imgAspect;
            } else {
                dh = h;
                dw = h * imgAspect;
            }
            dx = (w - dw) / 2;
            dy = (h - dh) / 2;
            this.ctx.save();
            this.ctx.globalAlpha = 0.4;
            try {
                this.ctx.drawImage(img, dx, dy, dw, dh);
            } catch (e) { }
            this.ctx.restore();
        } else {
            this.ctx.fillStyle = '#111';
            this.ctx.fillRect(0, 0, w, h);
        }
        // Gradient Overlay (Darker for text contrast)
        const grad = this.ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, 'rgba(0,0,0,0.3)');
        grad.addColorStop(1, 'rgba(0,0,0,0.8)');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, w, h);
        // Only draw particles/overlays, NO heavy geometry
        if (this.mode === 'EDM') {
            this.drawCyberpunk(w, h, bass, treble);
        } else if (this.mode === 'Lo-fi') {
            this.drawLofi(w, h, bass);
        } else if (this.mode === 'Classical') {
            this.drawGalaxy(w, h, bass, treble);
        } else if (this.mode === 'Rock') {
            this.drawRock(w, h, bass);
        } else {
            this.drawDefault(w, h, bass);
        }
    },
    drawDefault(w, h, bass) {
        this.ctx.fillStyle = `rgb(10, 10, 15)`;
        this.ctx.fillRect(0, 0, w, h);
        const radius = 50 + bass;
        this.ctx.beginPath();
        this.ctx.arc(w / 2, h / 2, radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = `hsl(${bass}, 100%, 50%)`;
        this.ctx.lineWidth = 5;
        this.ctx.stroke();
    },
    // Render Deep Dives (Video Panels)
    renderDeepDives() {
        if (!deepDiveContent || deepDiveContent.length === 0) return;
        const container = document.getElementById('big-panels-grid');
        if (container) {
            container.className = 'deep-dive-grid';
            container.innerHTML = '';
            let currentPreviewAudio = null;
            let currentPreviewVideo = null;
            let currentPreviewBtn = null;
            let currentPreviewInterval = null;
            const stopPreview = () => {
                if (currentPreviewAudio) {
                    currentPreviewAudio.pause();
                    currentPreviewAudio = null;
                }
                if (currentPreviewVideo) {
                    currentPreviewVideo.pause();
                    currentPreviewVideo.currentTime = 0;
                    currentPreviewVideo.style.opacity = '0.6';
                    currentPreviewVideo = null;
                }
                if (currentPreviewInterval) {
                    clearInterval(currentPreviewInterval);
                    currentPreviewInterval = null;
                }
                if (currentPreviewBtn) {
                    currentPreviewBtn.classList.remove('active');
                    currentPreviewBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i><span class="btn-text">Preview</span>';
                    currentPreviewBtn = null;
                }
            };
            // Loop 12 items for grid
            for (let i = 0; i < 12; i++) {
                // Determine Content Group for this panel
                // If deepDiveContent has fewer than 12 groups, wrap around
                const groupIndex = i % deepDiveContent.length;
                const groupItems = deepDiveContent[groupIndex];
                // If group is empty or invalid, skip
                if (!Array.isArray(groupItems) || groupItems.length === 0) continue;
                // Initial item to show (0)
                const initialItem = groupItems[0];
                const panel = document.createElement('div');
                panel.className = 'video-panel';
                panel.dataset.group = groupIndex;
                panel.dataset.current = 0; // Index within the group
                panel.innerHTML = `
                    <div class="panel-video-container">
                        <video class="panel-video" src="${initialItem.video}" loop muted playsinline></video>
                        <div class="panel-overlay">
                            <!-- Preview Button -->
                            <button class="preview-btn">
                                <i class="fa-solid fa-volume-high"></i>
                                <span class="btn-text">Preview</span>
                            </button>
                            <div class="panel-top">
                                <img src="https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=100&h=100&fit=crop" class="panel-mini-cover" style="opacity:0.8">
                                <div class="panel-meta">
                                    <div class="panel-type">${initialItem.type}</div>
                                    <div class="panel-title">${initialItem.title}</div>
                                </div>
                            </div>
                            <!-- Navigation Controls -->
                            <div class="panel-center-controls">
                                <button class="panel-nav config-prev"><i class="fa-solid fa-chevron-left"></i></button>
                                <button class="panel-nav config-next"><i class="fa-solid fa-chevron-right"></i></button>
                            </div>
                            <div class="panel-bottom">
                                <div class="panel-desc">${initialItem.desc}</div>
                                <div class="panel-song-info">
                                    <i class="fa-solid fa-chart-simple"></i>
                                    <span>${initialItem.audio.replace('.mp3', '').replace('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-', 'Track ')}</span>
                                </div>
                                <div class="panel-actions">
                                    <button class="panel-play-btn"><i class="fa-solid fa-play"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                // Elements
                const video = panel.querySelector('video');
                const title = panel.querySelector('.panel-title');
                const type = panel.querySelector('.panel-type');
                const desc = panel.querySelector('.panel-desc');
                const songTitle = panel.querySelector('.panel-song-info span');
                const previewBtn = panel.querySelector('.preview-btn');
                const prevBtn = panel.querySelector('.config-prev');
                const nextBtn = panel.querySelector('.config-next');
                // Helper to get current item data
                const getCurrentItem = () => {
                    const cIdx = parseInt(panel.dataset.current);
                    return groupItems[cIdx];
                };
                // Panel Click -> Open Page
                panel.addEventListener('click', (e) => {
                    if (e.target.closest('.preview-btn') || e.target.closest('.panel-actions') || e.target.closest('.panel-nav')) return;
                    stopPreview();
                    openDeepDivePage(getCurrentItem());
                });
                // Hover Logic
                panel.addEventListener('mouseenter', () => {
                    if (currentPreviewVideo !== video) {
                        video.play().catch(e => { });
                        video.style.opacity = '1';
                    }
                });
                panel.addEventListener('mouseleave', () => {
                    if (currentPreviewVideo !== video) {
                        video.pause();
                        video.currentTime = 0;
                        video.style.opacity = '0.6';
                    }
                    stopPreview(); // Also stop preview on leave
                });
                // Preview Logic
                previewBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const item = getCurrentItem();
                    if (currentPreviewBtn === previewBtn) {
                        stopPreview();
                        return;
                    }
                    stopPreview();
                    if (item.audio) {
                        // Ensure we use ONLY the global singleton audio object 
                        // to avoid background audio issues on mobile
                        const wasPlaying = !audio.paused;
                        // If it's the main track currently playing, pause it for preview
                        if (wasPlaying && audio.dataset.currentSongId !== "preview") {
                            audio.pause();
                            updatePlayButton();
                        }
                        // Clear previous loop interval
                        if (currentPreviewInterval) {
                            clearInterval(currentPreviewInterval);
                            currentPreviewInterval = null;
                        }
                        // Use global audio for preview
                        audio.src = item.audio;
                        audio.dataset.currentSongId = "preview"; // special handle
                        audio.volume = 0.5;
                        video.currentTime = 0;
                        video.style.opacity = '1';
                        audio.play().catch(e => console.log(e));
                        video.play().catch(e => console.log(e));
                        currentPreviewAudio = audio;
                        currentPreviewVideo = video;
                        currentPreviewBtn = previewBtn;
                        // 30s Loop Logic
                        currentPreviewInterval = setInterval(() => {
                            if (audio && audio.currentTime >= 30 && audio.dataset.currentSongId === "preview") {
                                audio.currentTime = 0;
                                video.currentTime = 0;
                                audio.play();
                                video.play();
                            }
                        }, 1000);
                        previewBtn.classList.add('active');
                        const barsHtml = `
        <div class="equalizer">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
        </div>
    `;
                        let tName = item.audio
                            .replace('.mp3', '')
                            .replace('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-', 'Track ');
                        if (item.audio === "On My Way.mp3") tName = "On My Way";
                        previewBtn.innerHTML = `${barsHtml}<span class="btn-text">${tName}</span>`;
                        // Correct loop fallback
                        previewAudio.onended = () => {
                            previewAudio.currentTime = 0;
                            previewAudio.play();
                        };
                    }
                });
                // Navigation Logic
                const updatePanelUI = (index) => {
                    // Wrap
                    if (index < 0) index = groupItems.length - 1;
                    if (index >= groupItems.length) index = 0;
                    stopPreview();
                    panel.dataset.current = index;
                    const item = groupItems[index];
                    // Update DOM
                    title.innerText = item.title;
                    type.innerText = item.type;
                    desc.innerText = item.desc;
                    songTitle.innerText = item.audio.replace('.mp3', '').replace('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-', 'Track ');
                    video.src = item.video; // Change video if different
                    if (panel.matches(':hover')) {
                        video.play().catch(e => { });
                    }
                };
                prevBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    updatePanelUI(parseInt(panel.dataset.current) - 1);
                });
                nextBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    updatePanelUI(parseInt(panel.dataset.current) + 1);
                });
                container.appendChild(panel);
            }
        }
    },
    drawCyberpunk(w, h, bass, treble) {
        // Just the pulses/particles, NO GRID (cleaner look)
        // Add some random neon sparks
        if (Math.random() > 0.9) {
            this.ctx.fillStyle = `rgba(0, 255, 255, ${Math.random()})`;
            this.ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
        }
    },
    drawLofi(w, h, bass) {
        // Transparent BG
        // this.ctx.fillStyle = 'rgba(10, 15, 30, 0.3)';
        // this.ctx.fillRect(0, 0, w, h);
        this.ctx.strokeStyle = 'rgba(200, 200, 255, 0.6)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        if (this.particles) {
            this.particles.forEach(p => {
                p.y += p.speed;
                if (p.y > h) p.y = 0;
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(p.x, p.y + p.len);
            });
        }
        this.ctx.stroke();
        const light = 100 + bass / 2;
        this.ctx.fillStyle = `rgba(255, 200, 150, ${0.05 + bass / 800})`;
        this.ctx.beginPath();
        this.ctx.arc(w / 2, h / 2, light * 3, 0, Math.PI * 2);
        this.ctx.fill();
    },
    drawGalaxy(w, h, bass, treble) {
        // Transparent BG
        // this.ctx.fillStyle = 'rgba(5, 5, 20, 0.2)';
        // this.ctx.fillRect(0, 0, w, h);
        this.ctx.fillStyle = 'white';
        if (this.particles) {
            this.particles.forEach(p => {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.globalAlpha = Math.random() * (0.5 + treble / 255);
                this.ctx.fill();
            });
        }
        this.ctx.globalAlpha = 1;
        this.ctx.beginPath();
        this.ctx.arc(w / 2, h / 2, 100 + bass / 5, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(50, 0, 100, 0.1)`;
        this.ctx.strokeStyle = `rgba(100, 50, 255, ${bass / 255})`;
        this.ctx.lineWidth = 2;
        this.ctx.fill();
        this.ctx.stroke();
        if (treble > 150 && Math.random() > 0.9) {
            this.ctx.beginPath();
            const sx = Math.random() * w;
            const sy = Math.random() * h;
            this.ctx.moveTo(sx, sy);
            this.ctx.lineTo(sx + 100, sy + 100);
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        }
    },
    drawRock(w, h, bass) {
        // Just the camera shake effect handles the "Rock" vibe
        // No extra geometry needed on top of the intense background
        if (bass > 200) {
            const shake = (Math.random() - 0.5) * 10;
            this.ctx.save();
            this.ctx.translate(shake, shake);
            this.ctx.restore();
        }
    }
};
// Make Visualizer global
window.Visualizer = Visualizer;
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
        // Stop animation
        if (Visualizer.animationId) {
            cancelAnimationFrame(Visualizer.animationId);
            Visualizer.animationId = null;
        }
        // Close AudioContext
        if (Visualizer.audioContext) {
            Visualizer.audioContext.close();
            Visualizer.audioContext = null;
        }
        console.log("Visualizer paused for background stability");
    }
    if (document.visibilityState === "visible") {
        // Restart visualizer only if music is playing
        if (!audio.paused) {
            Visualizer.setupAudio();
            Visualizer.animate();
        }
        console.log("Visualizer resumed");
    }
});
// Hook into init
const originalInit = init;
init = function () {
    originalInit();
    if (window.Visualizer) window.Visualizer.init();
    try {
        if (
            typeof updatePlayerUI === 'function' &&
            typeof songs !== 'undefined' &&
            songs.length > 0 &&
            !audio.dataset.currentSongId   // 👈 important condition
        ) {
            updatePlayerUI(songs[0]);
        }
    } catch (e) {
        console.error("Failed to update UI on init:", e);
    }
    setupCarouselNav('featured-prev', 'featured-next', 'featured-grid');
    setupCarouselNav('artist-prev', 'artist-next', 'artist-carousel');
    setupSidebarToggle();
};
function setupSidebarToggle() {
    const sidebar = document.getElementById('right-sidebar');
    const closeBtn = document.getElementById('rs-close-btn');
    const openBtn = document.getElementById('rs-open-btn');
    const toggle = () => {
        sidebar.classList.toggle('collapsed');
    };
    if (closeBtn) closeBtn.addEventListener('click', toggle);
    if (openBtn) openBtn.addEventListener('click', toggle);
}
function setupCarouselNav(prevId, nextId, gridId) {
    const prev = document.getElementById(prevId);
    const next = document.getElementById(nextId);
    const grid = document.getElementById(gridId);
    if (prev && next && grid) {
        prev.addEventListener('click', () => {
            grid.scrollBy({ left: -300, behavior: 'smooth' });
        });
        next.addEventListener('click', () => {
            grid.scrollBy({ left: 300, behavior: 'smooth' });
        });
    }
}
// Hook into Play to start AudioContext if needed
// Store original play only once
if (!audio.originalPlay) {
    audio.originalPlay = audio.play;
}
audio.play = async function () {
    try {
        if (window.Visualizer) {
            await window.Visualizer.setupAudio(); // make setup async-safe
        }
        if (window.AudioContext && window.Visualizer?.audioCtx?.state === 'suspended') {
            await window.Visualizer.audioCtx.resume(); // Resume context
        }
        return audio.originalPlay.apply(this, arguments);
    } catch (err) {
        console.error("Audio play failed:", err);
    }
};
// Initialize PWA and install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    console.log("🔥 beforeinstallprompt fired");
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) {
        installBtn.style.display = 'block';
        console.log("✅ Install button shown");
    }
});
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(() => console.log('Service Worker Registered'))
            .catch(err => console.log('SW registration failed:', err));
    });
}
const installBtn = document.getElementById('pwa-install-btn');
if (installBtn) {
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('Install outcome:', outcome);
        deferredPrompt = null;
        installBtn.style.display = 'none';
    });
}
// Start
init();
// --- Mini Player (PiP) Logic ---
let miniPlayerWindow = null;
async function toggleMiniPlayer() {
    if (miniPlayerWindow) {
        miniPlayerWindow.close();
        miniPlayerWindow = null;
        return;
    }
    if (!window.documentPictureInPicture) {
        alert("Mini Player (Document Picture-in-Picture) is not supported in this browser. Please use Chrome 116+ or Edge 116+.");
        return;
    }
    try {
        miniPlayerWindow = await documentPictureInPicture.requestWindow({
            width: 400,
            height: 500
        });
        const doc = miniPlayerWindow.document;
        // Copy Styles from Main Window
        [...document.styleSheets].forEach((styleSheet) => {
            try {
                if (styleSheet.href) {
                    const link = doc.createElement('link');
                    link.rel = 'stylesheet';
                    link.type = styleSheet.type;
                    link.media = styleSheet.media;
                    link.href = styleSheet.href;
                    doc.head.appendChild(link);
                } else {
                    const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
                    const style = doc.createElement('style');
                    style.textContent = cssRules;
                    doc.head.appendChild(style);
                }
            } catch (e) {
                console.warn("Could not copy stylesheet:", e);
            }
        });
        // Add FontAwesome explicitly to ensure icons work
        const faLink = doc.createElement('link');
        faLink.rel = 'stylesheet';
        faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
        doc.head.appendChild(faLink);
        // Build UI
        // Fix: Use currentPlaylist instead of songs to ensure correct song is shown
        let currentSong = {};
        if (typeof currentPlaylist !== 'undefined' && currentPlaylist.length > 0) {
            currentSong = currentPlaylist[currentSongIndex] || {};
        } else {
            currentSong = songs[currentSongIndex] || {};
        }
        const isPlaying = !audio.paused;
        doc.body.innerHTML = `
            <div class="mini-player-container">
                <img src="${currentSong.cover || 'https://via.placeholder.com/300'}" class="mini-bg" id="mp-bg">
                <div class="mini-overlay">
                    <div class="mini-top-bar">
                        <div class="mini-logo"><i class="fa-solid fa-music"></i> BeatFlow</div>
                    </div>
                    
                    <div class="mini-controls-center">
                        <button class="mini-btn-control" id="mp-volume" title="Mute/Unmute">
                            ${audio.muted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>'}
                        </button>
                        <button class="mini-btn-control" id="mp-shuffle" title="Shuffle">
                            <i class="fa-solid fa-shuffle" style="color: ${isShuffleOn ? 'var(--primary-color)' : 'white'}"></i>
                        </button>
                        <button class="mini-btn-control" id="mp-prev"><i class="fa-solid fa-backward-step"></i></button>
                        <button class="mini-btn-play" id="mp-play">
                            ${isPlaying ? '<i class="fa-solid fa-circle-pause"></i>' : '<i class="fa-solid fa-circle-play"></i>'}
                        </button>
                        <button class="mini-btn-control" id="mp-next"><i class="fa-solid fa-forward-step"></i></button>
                        <button class="mini-btn-control" id="mp-loop" title="Loop">
                            <i class="fa-solid fa-repeat" style="color: ${audio.loop ? 'var(--primary-color)' : 'white'}"></i>
                        </button>
                        <button class="mini-btn-control" id="mp-share" title="Share">
                            <i class="fa-solid fa-share-from-square"></i>
                        </button>
                    </div>
                    <div class="mini-bottom-bar">
                        <div class="mini-progress-container" id="mp-progress">
                            <div class="mini-progress-fill" id="mp-progress-fill" style="width: 0%"></div>
                        </div>
                        <div class="mini-meta">
                            <div class="mini-track-info">
                                <div class="mini-track-title" id="mp-title">${currentSong.title || 'No Song'}</div>
                                <div class="mini-track-artist" id="mp-artist">${currentSong.artist || 'Unknown'}</div>
                            </div>
                            <button class="mini-like-btn" id="mp-like">
                                ${isLiked(currentSong.id) ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        // Event Listeners within PiP
        // Play/Prev/Next
        doc.getElementById('mp-play').addEventListener('click', togglePlay);
        doc.getElementById('mp-prev').addEventListener('click', playPrev);
        doc.getElementById('mp-next').addEventListener('click', playNext);
        // Volume
        const volBtn = doc.getElementById('mp-volume');
        volBtn.addEventListener('click', () => {
            audio.muted = !audio.muted;
            // Update Mini Player UI
            volBtn.innerHTML = audio.muted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
            // Sync Main Player UI
            const mainMute = document.getElementById('mute-btn');
            if (mainMute) {
                mainMute.innerHTML = audio.muted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
            }
            const mainVol = document.getElementById('volume-slider');
            if (mainVol) {
                mainVol.value = audio.muted ? 0 : (audio.volume || 1);
            }
        });
        // Shuffle
        const shufBtn = doc.getElementById('mp-shuffle');
        shufBtn.addEventListener('click', () => {
            isShuffleOn = !isShuffleOn;
            // Update Mini Player UI
            shufBtn.innerHTML = `<i class="fa-solid fa-shuffle" style="color: ${isShuffleOn ? 'var(--primary-color)' : 'white'}"></i>`;
            // Sync Main Player UI
            const mainShuf = document.getElementById('shuffle-btn');
            if (mainShuf) {
                mainShuf.classList.toggle('active', isShuffleOn);
                mainShuf.style.color = isShuffleOn ? 'var(--primary-color)' : '#b3b3b3';
            }
        });
        // Loop
        const loopBtn = doc.getElementById('mp-loop');
        loopBtn.addEventListener('click', () => {
            audio.loop = !audio.loop;
            // Update Mini Player UI
            loopBtn.innerHTML = `<i class="fa-solid fa-repeat" style="color: ${audio.loop ? 'var(--primary-color)' : 'white'}"></i>`;
            // Sync Main Player UI
            const mainLoop = document.getElementById('loop-btn');
            if (mainLoop) {
                mainLoop.style.color = audio.loop ? 'var(--primary-color)' : '#b3b3b3';
            }
        });
        // Share
        doc.getElementById('mp-share').addEventListener('click', () => {
            // Fix: fetching song from correct source
            let song = songs[currentSongIndex];
            if (typeof currentPlaylist !== 'undefined' && currentPlaylist.length > 0) {
                song = currentPlaylist[currentSongIndex];
            }
            if (!song) return;
            const text = `Listening to ${song.title} by ${song.artist} on BeatFlow!`;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(() => {
                    const icon = doc.querySelector('#mp-share i');
                    if (icon) {
                        icon.className = 'fa-solid fa-check';
                        icon.style.color = 'var(--primary-color)';
                        setTimeout(() => {
                            icon.className = 'fa-solid fa-share-from-square';
                            icon.style.color = 'white';
                        }, 2000);
                    }
                }).catch(err => {
                    console.error('Clipboard failed', err);
                    //  alert("Could not copy to clipboard. Permission denied?"); // Avoid alert in PiP if possible
                });
            }
        });
        // Like
        doc.getElementById('mp-like').addEventListener('click', () => {
            // Fix: fetching song from correct source
            let song = songs[currentSongIndex];
            if (typeof currentPlaylist !== 'undefined' && currentPlaylist.length > 0) {
                song = currentPlaylist[currentSongIndex];
            }
            if (song) {
                toggleLike(song);
                updateMiniPlayerUI();
            }
        });
        // Seek
        doc.getElementById('mp-progress').addEventListener('click', (e) => {
            const width = doc.getElementById('mp-progress').clientWidth;
            const clickX = e.offsetX;
            const duration = audio.duration;
            audio.currentTime = (clickX / width) * duration;
        });
        // Cleanup
        miniPlayerWindow.addEventListener("pagehide", (event) => {
            miniPlayerWindow = null;
        });
        // Initial Progress
        updateMiniPlayerProgress(audio.currentTime, audio.duration);
    } catch (err) {
        console.error("Failed to open Mini Player:", err);
    }
}
function updateMiniPlayerUI() {
    if (!miniPlayerWindow) return;
    const doc = miniPlayerWindow.document;
    // Fix: Use currentPlaylist
    let song = null;
    if (typeof currentPlaylist !== 'undefined' && currentPlaylist.length > 0) {
        song = currentPlaylist[currentSongIndex];
    } else {
        song = songs[currentSongIndex];
    }
    if (!song) return;
    const bg = doc.getElementById('mp-bg');
    if (bg) bg.src = song.cover;
    const title = doc.getElementById('mp-title');
    if (title) title.innerText = song.title;
    const artist = doc.getElementById('mp-artist');
    if (artist) artist.innerText = song.artist;
    // Update Play Button
    const playBtn = doc.getElementById('mp-play');
    if (playBtn) playBtn.innerHTML = !audio.paused ? '<i class="fa-solid fa-circle-pause"></i>' : '<i class="fa-solid fa-circle-play"></i>';
    // Update Like Button
    const liked = isLiked(song.id);
    const likeBtn = doc.getElementById('mp-like');
    if (likeBtn) {
        likeBtn.innerHTML = liked ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>';
        likeBtn.style.color = liked ? '#1db954' : '#fff';
    }
    // Update Shuffle State
    const shufBtn = doc.getElementById('mp-shuffle');
    if (shufBtn) {
        shufBtn.innerHTML = `<i class="fa-solid fa-shuffle" style="color: ${isShuffleOn ? 'var(--primary-color)' : 'white'}"></i>`;
    }
    // Update Loop State
    const loopBtn = doc.getElementById('mp-loop');
    if (loopBtn) {
        loopBtn.innerHTML = `<i class="fa-solid fa-repeat" style="color: ${audio.loop ? 'var(--primary-color)' : 'white'}"></i>`;
    }
    // Update Volume State
    const volBtn = doc.getElementById('mp-volume');
    if (volBtn) {
        volBtn.innerHTML = audio.muted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
    }
}
function updateMiniPlayerProgress(currentTime, duration) {
    if (!miniPlayerWindow) return;
    const doc = miniPlayerWindow.document;
    const fill = doc.getElementById('mp-progress-fill');
    if (fill && duration) {
        const percent = (currentTime / duration) * 100;
        fill.style.width = `${percent}%`;
    }
}
// Mobile Responsiveness Logic
function setupMobileNavigation() {
    const bottomNav = document.querySelector('.bottom-nav');
    if (!bottomNav) return;
    const navItems = bottomNav.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.dataset.target;
            if (target) {
                // If dashboard/library, ensure logic
                if (target === 'dashboard') {
                    // Ensure we show library view, maybe specific filter?
                    // Just showView('dashboard') is enough as per existing logic
                    showView('dashboard');
                } else if (target === 'search') {
                    showView('search');
                    setTimeout(() => {
                        const input = document.getElementById('search-input');
                        if (input) input.focus();
                    }, 100);
                } else {
                    showView(target);
                }
                navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');
            }
        });
    });
}
// Ensure mobile features are initialized
document.addEventListener('DOMContentLoaded', () => {
    // Run setup
    setupMobileNavigation();
    // Mobile Play Button Click Handler
    const miniBtn = document.getElementById('mini-play-btn');
    if (miniBtn) {
        miniBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePlay();
        });
    }
});
// Since DOMContentLoaded might have already fired if script is loaded late or via SPA nav (though here it's simple auth),
// we also call it immediately if ready.
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setupMobileNavigation();
    const miniBtn = document.getElementById('mini-play-btn');
    if (miniBtn) {
        // Remove old listener if any to avoid duplicates? 
        // Better to just add one. cloneNode trick or just rely on DOMContentLoaded not firing twice.
        // Simple generic add is fine.
        miniBtn.onclick = (e) => {
            e.stopPropagation();
            togglePlay();
        };
    }
}
// Mobile Search UI Rendering
const browseCategories = {
    start: [
        { title: 'Music', color: '#E91429', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop' },
        { title: 'Podcasts', color: '#006450', img: 'https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?w=300&h=300&fit=crop' },
        { title: 'Live Events', color: '#8400E7', img: 'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?w=300&h=300&fit=crop' },
        { title: 'Home of I-Pop', color: '#142a63', img: 'https://images.unsplash.com/photo-1520166012956-add9ba0835bb?w=300&h=300&fit=crop' }
    ],
    browseAll: [
        { title: 'Made For You', color: '#509BF5', img: 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?w=300&h=300&fit=crop' },
        { title: 'New Releases', color: '#E91429', img: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?w=300&h=300&fit=crop' },
        { title: 'Hindi', color: '#D84000', img: 'https://images.unsplash.com/photo-1626126525134-fbbc06b9b96c?w=300&h=300&fit=crop' },
        { title: 'Punjabi', color: '#A56752', img: 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=300&h=300&fit=crop' },
        { title: 'Tamil', color: '#B06239', img: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=300&h=300&fit=crop' },
        { title: 'Telugu', color: '#E1118C', img: 'https://images.unsplash.com/photo-1621112904866-9aec03621ee5?w=300&h=300&fit=crop' },
        { title: 'Charts', color: '#8D67AB', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop' },
        { title: 'Pop', color: '#438270', img: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?w=300&h=300&fit=crop' },
        { title: 'Indie', color: '#E91429', img: 'https://images.unsplash.com/photo-1484876065684-b683cf17d276?w=300&h=300&fit=crop' },
        { title: 'Trending', color: '#B02897', img: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop' },
        { title: 'Love', color: '#E91429', img: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&h=300&fit=crop' },
        { title: 'Discover', color: '#8D67AB', img: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&h=300&fit=crop' },
        { title: 'Radio', color: '#509BF5', img: 'https://images.unsplash.com/photo-1585255318859-f5c15f4cffe9?w=300&h=300&fit=crop' },
        { title: 'Mood', color: '#E1118C', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop' },
        { title: 'Party', color: '#537AA1', img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&h=300&fit=crop' },
        { title: 'Dance', color: '#5179A1', img: 'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?w=300&h=300&fit=crop' }
    ]
};
function renderMobileSearch() {
    const carousel = document.getElementById('browse-carousel');
    const grid = document.getElementById('browse-all-grid');
    if (!carousel || !grid) return;
    // Render Carousel
    carousel.innerHTML = browseCategories.start.map(item => `
        <div class="browse-category-card" style="background-color: ${item.color}">
            <span>${item.title}</span>
            <img src="${item.img}" loading="lazy">
        </div>
    `).join('');
    // Render Grid
    grid.innerHTML = browseCategories.browseAll.map(item => `
        <div class="browse-category-card" style="background-color: ${item.color}">
            <span>${item.title}</span>
            <img src="${item.img}" loading="lazy">
        </div>
    `).join('');
    // Add Click Listeners (Mock)
    document.querySelectorAll('.browse-category-card').forEach(card => {
        card.addEventListener('click', () => {
            // Mock interaction
            console.log('Clicked category:', card.querySelector('span').innerText);
        });
    });
}
// Logic to toggle Search vs Browse
function setupSearchToggle() {
    const input = document.getElementById('search-input-mobile');
    const browseContent = document.getElementById('search-browse-content');
    const resultsContainer = document.getElementById('search-results-container');
    const resultsGrid = document.getElementById('search-results-grid'); // Re-use main grid if needed or separate
    const clearBtn = document.getElementById('mobile-search-clear');
    if (!input) return;
    // Helper to toggle clear button
    const toggleClearBtn = () => {
        if (clearBtn) {
            clearBtn.style.display = input.value.trim().length > 0 ? 'block' : 'none';
        }
    };
    // Clear Logic
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            input.value = '';
            toggleClearBtn();
            input.focus();
            // Trigger input event to reset view
            input.dispatchEvent(new Event('input'));
        });
    }
    input.addEventListener('input', (e) => {
        toggleClearBtn();
        const query = e.target.value.trim().toLowerCase();
        if (query.length > 0) {
            browseContent.style.display = 'none';
            resultsContainer.style.display = 'block';
            // Perform Search (Re-use existing logic logic)
            const results = songs.filter(s => s.title.toLowerCase().includes(query) || s.artist.toLowerCase().includes(query));
            resultsGrid.innerHTML = '';
            if (results.length === 0) {
                resultsGrid.innerHTML = '<div style="color:#888; padding:20px; text-align:center;">No songs found.</div>';
            } else {
                results.forEach(song => {
                    const card = createCard(song.title, song.artist, song.cover, () => playSong(song));
                    resultsGrid.appendChild(card);
                });
            }
        } else {
            browseContent.style.display = 'block';
            resultsContainer.style.display = 'none';
        }
    });
}
// Mobile Deep Dive Rendering
function renderMobileDeepDives() {
    const carousel = document.getElementById('mobile-deep-dive-carousel');
    if (!carousel || !deepDiveContent) return;
    // Flatten deep dive groups for carousel
    const allDeepDives = deepDiveContent.flat();
    carousel.innerHTML = allDeepDives.map((item, index) => {
        // Use video if available, or cover
        const videoSrc = item.video || "";
        return `
        <div class="mobile-video-panel" data-index="${index}">
            <div class="mobile-video-container" style="width:100%; height:100%;">
                 <video src="${videoSrc}" loop muted playsinline preload="metadata" style="width:100%; height:100%; object-fit:cover;"></video>
            </div>
            <div class="mobile-panel-overlay">
                <div class="panel-type" style="font-size: 10px; color: #1db954; font-weight:700; text-transform:uppercase;">${item.type}</div>
                <div class="panel-title" style="font-size: 18px; margin-bottom: 5px; font-weight:700; color:white;">${item.title}</div>
                <div class="panel-desc" style="font-size: 12px; color: #ccc; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${item.desc}</div>
            </div>
             <div style="position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.5); padding: 6px 10px; border-radius: 20px; font-size: 10px; display: flex; align-items: center; gap: 5px;">
                <i class="fa-solid fa-play"></i> Watch
            </div>
        </div>
        `;
    }).join('');
    // Add Click Listeners
    carousel.querySelectorAll('.mobile-video-panel').forEach((panel, index) => {
        panel.addEventListener('click', () => {
            openDeepDivePage(allDeepDives[index]);
        });
    });
    // Intersection Observer for Autoplay
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target.querySelector('video');
            if (entry.isIntersecting) {
                entry.target.classList.add('playing');
                if (video) {
                    const playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => { /**/ });
                    }
                }
            } else {
                entry.target.classList.remove('playing');
                if (video) {
                    video.pause();
                    video.currentTime = 0;
                }
            }
        });
    }, {
        root: carousel,
        threshold: 0.6 // Play when 60% visible
    });
    carousel.querySelectorAll('.mobile-video-panel').forEach(panel => {
        observer.observe(panel);
    });
}
// Initialize
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    renderMobileSearch();
    renderMobileDeepDives();
    setupSearchToggle();
    initMobilePlayerLogic();
} else {
    document.addEventListener('DOMContentLoaded', () => {
        renderMobileSearch();
        renderMobileDeepDives();
        setupSearchToggle();
        initMobilePlayerLogic();
    });
}
// =========================================
// 📱 MOBILE FULL PAGE PLAYER LOGIC
// =========================================
function initMobilePlayerLogic() {
    setupMobileFullPlayer();
    // Hook into updateMiniPlayerUI
    if (typeof updateMiniPlayerUI === 'function') {
        const originalUpdateMiniPlayerUI = updateMiniPlayerUI;
        updateMiniPlayerUI = function () {
            originalUpdateMiniPlayerUI();
            updateMobilePlayerUI();
        };
    }
    // Hook into updatePlayerUI
    if (typeof updatePlayerUI === 'function') {
        const originalUpdatePlayerUI = updatePlayerUI;
        updatePlayerUI = function (song) {
            originalUpdatePlayerUI(song);
            updateMobilePlayerUI();
        };
    }
    // Hook into updatePlayButton
    if (typeof updatePlayButton === 'function') {
        const originalUpdatePlayButton = updatePlayButton;
        updatePlayButton = function () {
            originalUpdatePlayButton();
            updateMobilePlayerUI();
        };
    }
    // Add independent time update listener
    if (audio) {
        audio.addEventListener('timeupdate', updateMobileProgress);
    }
}
function setupMobileFullPlayer() {
    const overlay = document.getElementById('mobile-player-overlay');
    const closeBtn = document.getElementById('close-mobile-player');
    const miniPlayer = document.querySelector('.now-playing-mini');
    if (!overlay || !miniPlayer) return;
    // Open Overlay
    miniPlayer.addEventListener('click', (e) => {
        // Only on mobile
        if (window.innerWidth <= 768) {
            // Prevent opening if clicking specific mini-buttons if necessary, 
            // but usually clicking the bar opens it.
            if (e.target.closest('.mini-btn')) return;
            openMobilePlayer();
        }
    });
    // Swipe Up on Mini Player to Open
    let touchStartY = 0;
    let touchEndY = 0;
    miniPlayer.addEventListener('touchstart', (e) => {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    miniPlayer.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipeGesture();
    }, { passive: true });
    function handleSwipeGesture() {
        if (window.innerWidth > 768) return;
        const swipeDistance = touchStartY - touchEndY;
        // Swipe Up > 50px
        if (swipeDistance > 50) {
            openMobilePlayer();
        }
    }
    function openMobilePlayer() {
        overlay.classList.add('open');
        document.body.classList.add('mobile-player-active'); // Add class
        document.body.style.overflow = 'hidden'; // Prevent scrolling bg
        updateMobilePlayerUI(); // Ensure fresh data
    }
    // Close Overlay
    function closeMobilePlayer() {
        overlay.classList.remove('open');
        document.body.classList.remove('mobile-player-active'); // Remove class
        document.body.style.overflow = '';
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMobilePlayer);
    }
    // Swipe Down to Close (on Overlay Header or Main Body)
    // We attach to overlay, but need to be careful of inner scrolls (like lyrics or list)
    // For now, attach to header and artwork area for safety
    const swipeTargets = [
        document.querySelector('.mobile-player-header'),
        document.querySelector('.mobile-player-artwork')
    ];
    let closeTouchStartY = 0;
    let closeTouchEndY = 0;
    swipeTargets.forEach(target => {
        if (!target) return;
        target.addEventListener('touchstart', (e) => {
            closeTouchStartY = e.changedTouches[0].screenY;
        }, { passive: true });
        target.addEventListener('touchend', (e) => {
            closeTouchEndY = e.changedTouches[0].screenY;
            handleCloseSwipe();
        }, { passive: true });
    });
    function handleCloseSwipe() {
        const swipeDistance = closeTouchEndY - closeTouchStartY;
        // Swipe Down > 50px
        if (swipeDistance > 50) {
            closeMobilePlayer();
        }
    }
}
// =========================================
// 📱 MOBILE OPTIONS MENU LOGIC
// =========================================
function openMobileMenu(song) {
    const sheet = document.getElementById('mobile-options-sheet');
    if (!sheet) return;
    // Populate Data
    document.getElementById('mo-cover').src = song.cover || 'https://via.placeholder.com/50';
    document.getElementById('mo-title').innerText = song.title || 'Unknown Title';
    document.getElementById('mo-artist').innerText = song.artist || 'Unknown Artist';
    document.getElementById('mo-meta').innerText = `${song.album || 'Single'} • ${song.year || '2024'}`;
    // Show Sheet
    sheet.classList.add('open');
    document.body.style.overflow = 'hidden'; // Prevent bg scroll
    // Setup Actions (Closure or Re-attach)
    // Ideally we should have persistent listeners and just update a currentSong reference, 
    // but for simplicity we can handle clicks here or use data attributes.
    function stopProp(e) {
        e.stopPropagation();
    }
    // Check if in library
    const addLibBtn = document.getElementById('mo-add-lib');
    const isAdded = library.includes(song.id);
    if (addLibBtn) {
        addLibBtn.innerHTML = isAdded ?
            '<i class="fa-solid fa-check" style="color:#b026ff"></i><span>Remove from Library</span>' :
            '<i class="fa-solid fa-plus"></i><span>Add to Library</span>';
        addLibBtn.onclick = (e) => {
            e.stopPropagation();
            // Toggle Library
            const index = library.indexOf(song.id);
            if (index > -1) {
                library.splice(index, 1);
            } else {
                library.push(song.id);
            }
            localStorage.setItem('neonLibrary', JSON.stringify(library));
            // Sync UI (like buttons)
            // We can just call renderHome or update specific buttons if we want, 
            // or rely on next render.
            // But let's at least toggle the heart if visual.
            // toggleLike might do more than we want if it's tied to player state?
            // Actually toggleLike just updates array and UI.
            // Let's manually trigger UI update for active view to be safe/fast.
            if (openAlbum && document.querySelector('#album-view').style.display === 'flex') {
                // Re-render album or just find the button?
                // Finding button is better.
                const btn = document.querySelector(`.like-btn[data-id="${song.id}"]`);
                if (btn) {
                    const liked = library.includes(song.id);
                    btn.innerHTML = liked ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>';
                    btn.classList.toggle('liked', liked);
                    btn.style.color = liked ? '#1db954' : '#b3b3b3';
                }
            }
            closeMobileMenu();
        };
    }
    // Play Next
    const playNextBtn = document.getElementById('mo-play-next');
    if (playNextBtn) {
        playNextBtn.onclick = (e) => {
            e.stopPropagation();
            if (currentPlaylist) {
                currentPlaylist.splice(currentSongIndex + 1, 0, song);
                alert(`Added to queue: ${song.title}`);
            }
            closeMobileMenu();
        };
    }
    // Add to Queue
    const addToQueueBtn = document.getElementById('mo-add-queue');
    if (addToQueueBtn) {
        addToQueueBtn.onclick = (e) => {
            e.stopPropagation();
            if (currentPlaylist) {
                currentPlaylist.push(song);
                alert(`Added to queue: ${song.title}`);
            }
            closeMobileMenu();
        };
    }
    // Favourite
    const favBtn = document.getElementById('mo-fav');
    const isFav = isLiked(song.id);
    if (favBtn) {
        favBtn.innerHTML = isFav ?
            '<i class="fa-solid fa-heart" style="color:#1db954"></i><span>Liked</span>' :
            '<i class="fa-regular fa-heart"></i><span>Favourite</span>';
        favBtn.onclick = (e) => {
            e.stopPropagation();
            toggleLike(song);
            closeMobileMenu();
        };
    }
    // Prevent clicks on the content from closing (just in case)
    const content = sheet.querySelector('.mobile-options-content');
    if (content) {
        content.onclick = (e) => {
            e.stopPropagation();
        };
    }
}
function closeMobileMenu() {
    const sheet = document.getElementById('mobile-options-sheet');
    if (sheet) {
        sheet.classList.remove('open');
        document.body.style.overflow = '';
    }
}
// Setup Global Listeners for Menu
document.addEventListener('DOMContentLoaded', () => {
    const sheet = document.getElementById('mobile-options-sheet');
    const overlay = document.getElementById('mobile-options-overlay');
    const closeBtn = document.getElementById('mo-close-btn');
    if (overlay) overlay.addEventListener('click', closeMobileMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMobileMenu);
});
// Controls
// =========================================
// 📱 MOBILE PLAYER UI SYNC
// =========================================
function updateMobilePlayerUI(song) {
    if (!song) {
        if (audio.dataset.currentSongId && typeof songs !== 'undefined') {
            song = songs.find(s => String(s.id) === String(audio.dataset.currentSongId));
        }
        if (!song && typeof currentPlaylist !== 'undefined' && currentPlaylist.length > 0) {
            song = currentPlaylist[currentSongIndex];
        }
    }
    if (!song) return;
    const titleEl = document.getElementById('mobile-player-title');
    const artistEl = document.getElementById('mobile-player-artist');
    const topArtistEl = document.getElementById('mobile-top-artist');
    if (titleEl) titleEl.innerText = song.title;
    if (artistEl) artistEl.innerText = song.artist;
    if (topArtistEl) topArtistEl.innerText = song.artist;
    // Artwork Update (Both Main and Blurred Background)
    const coverEl = document.getElementById('mobile-player-img');
    const coverBlurEl = document.getElementById('mobile-player-img-large');
    const artworkUrl = song.cover || song.image;
    if (coverEl) coverEl.src = artworkUrl;
    if (coverBlurEl) coverBlurEl.src = artworkUrl;
    const playBtn = document.getElementById('mobile-play-btn');
    if (playBtn) {
        playBtn.innerHTML = audio.paused ? '<i class="fa-solid fa-play"></i>' : '<i class="fa-solid fa-pause"></i>';
    }
    const favBtn = document.getElementById('mobile-fav-btn');
    if (favBtn) {
        const liked = isLiked(song.id);
        favBtn.innerHTML = liked ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>';
        favBtn.style.color = liked ? '#ffd700' : 'white'; // Gold color if liked
    }
    updateMobileLyricsPreview();
    updateMobileProgress();
    // Update Lyrics View Header (New)
    const lImg = document.getElementById('lyrics-track-img');
    const lTitle = document.getElementById('lyrics-track-title');
    const lArtist = document.getElementById('lyrics-track-artist');
    const lBgImg = document.getElementById('lyrics-bg-img'); // New for desktop
    if (lImg) lImg.src = artworkUrl;
    if (lTitle) lTitle.innerText = song.title;
    if (lArtist) lArtist.innerText = song.artist;
    if (lBgImg) lBgImg.src = artworkUrl;
    const lyricsPlayBtn = document.getElementById('lyrics-play-btn');
    if (lyricsPlayBtn) {
        lyricsPlayBtn.innerHTML = audio.paused ? '<i class="fa-solid fa-play"></i>' : '<i class="fa-solid fa-pause"></i>';
    }
}
function updateMobileProgress() {
    // 1. Mobile Player Overlay Sync
    const mFill = document.getElementById('mobile-progress-fill');
    const mCurr = document.getElementById('mobile-curr-time');
    const mDur = document.getElementById('mobile-dur-time');
    // 2. Lyrics View Integration Sync (New)
    const lFill = document.getElementById('lyrics-progress-fill');
    const lCurr = document.getElementById('lyrics-curr-time');
    const lDur = document.getElementById('lyrics-dur-time');
    const duration = audio.duration;
    if (!isNaN(duration)) {
        const percent = (audio.currentTime / duration) * 100;
        const formattedCur = formatTime(audio.currentTime);
        const formattedDur = formatTime(duration);
        if (mFill) mFill.style.width = `${percent}%`;
        if (mCurr) mCurr.innerText = formattedCur;
        if (mDur) mDur.innerText = formattedDur;
        if (lFill) lFill.style.width = `${percent}%`;
        if (lCurr) lCurr.innerText = formattedCur;
        if (lDur) lDur.innerText = formattedDur;
    }
    if (isLyricsViewOpen) {
        // Find current line and scroll
        syncLyricsWithAudio();
    }
}
function updateMobileLyricsPreview() {
    const previewText = document.getElementById('mobile-lyrics-preview-text');
    if (!previewText) return;
    if (!currentLyrics || currentLyrics.length === 0) {
        previewText.innerText = "Connect to find lyrics...";
        previewText.style.opacity = "0.7";
        return;
    }
    // Find the current active line index
    let activeIndex = 0;
    for (let i = 0; i < currentLyrics.length; i++) {
        if (audio.currentTime >= currentLyrics[i].time) {
            activeIndex = i;
        } else {
            break;
        }
    }
    // Show a block of 4 lines starting from the active index to fit the card
    let previewLines = [];
    const blockCount = 4;
    for (let i = activeIndex; i < Math.min(activeIndex + blockCount, currentLyrics.length); i++) {
        // Only add non-empty lines
        const text = currentLyrics[i].text.trim();
        if (text) {
            previewLines.push(transliterateHindi(text));
        }
    }
    // If we gathered fewer than 4 lines, try to fill from the end if possible, 
    // but usually starting from activeIndex is what users expect for sync.
    previewText.innerText = previewLines.join('\n');
    previewText.style.opacity = "1";
    previewText.style.whiteSpace = "pre-line";
}
// Mobile Controls Listeners (Ensuring they are set up)
function setupMobileControls() {
    // 1. Playback Controls
    const mPlayBtn = document.getElementById('mobile-play-btn');
    if (mPlayBtn) mPlayBtn.onclick = (e) => { e.stopPropagation(); togglePlay(); };
    const mNextBtn = document.getElementById('mobile-next-btn');
    if (mNextBtn) mNextBtn.onclick = (e) => { e.stopPropagation(); playNext(); };
    const mPrevBtn = document.getElementById('mobile-prev-btn');
    if (mPrevBtn) mPrevBtn.onclick = (e) => { e.stopPropagation(); playPrev(); };
    // 2. Sticky Action Footer (Lyrics, Share, Shuffle)
    const mLyricsBtn = document.getElementById('mobile-lyrics-btn');
    if (mLyricsBtn) mLyricsBtn.onclick = (e) => {
        e.stopPropagation();
        toggleLyricsView();
    };
    const mShareBtnNew = document.getElementById('mobile-share-btn-new');
    if (mShareBtnNew) mShareBtnNew.onclick = (e) => {
        e.stopPropagation();
        let songId = audio.dataset.currentSongId;
        const s = (typeof songs !== 'undefined') ? songs.find(song => String(song.id) === String(songId)) : null;
        if (s && navigator.share) {
            navigator.share({
                title: s.title,
                text: `Checking out ${s.title} by ${s.artist} on BeatFlow!`,
                url: window.location.href
            }).catch(() => { });
        } else if (s) {
            navigator.clipboard.writeText(`Listening to ${s.title} on BeatFlow!`).then(() => {
                alert("Link copied to clipboard!");
            });
        }
    };
    const mShuffleBtnNew = document.getElementById('mobile-shuffle-btn-new');
    if (mShuffleBtnNew) mShuffleBtnNew.onclick = (e) => {
        e.stopPropagation();
        const mainShuffle = document.getElementById('shuffle-btn');
        if (mainShuffle) mainShuffle.click();
    };
    // 3. Track Info Actions (Fav, Options)
    const mFavBtn = document.getElementById('mobile-fav-btn');
    if (mFavBtn) mFavBtn.onclick = (e) => {
        e.stopPropagation();
        let songId = audio.dataset.currentSongId;
        const songFound = (typeof songs !== 'undefined') ? songs.find(s => String(s.id) === String(songId)) : null;
        if (songFound) {
            toggleLike(songFound);
            updateMobilePlayerUI(songFound);
        }
    };
    const mOptionsBtn = document.getElementById('mobile-options-btn');
    if (mOptionsBtn) mOptionsBtn.onclick = (e) => {
        e.stopPropagation();
        alert("More options coming soon!");
    };
    // 4. Navigation (Close)
    const mCloseBtn = document.getElementById('close-mobile-player');
    if (mCloseBtn) mCloseBtn.onclick = (e) => {
        e.stopPropagation();
        const overlay = document.getElementById('mobile-player-overlay');
        if (overlay) overlay.classList.remove('open');
        if (isLyricsViewOpen) toggleLyricsView();
    };
    // 6. Lyrics View Playback Integration (New)
    const lPlayBtn = document.getElementById('lyrics-play-btn');
    if (lPlayBtn) lPlayBtn.onclick = (e) => { e.stopPropagation(); togglePlay(); };
    const lNextBtn = document.getElementById('lyrics-next-btn');
    if (lNextBtn) lNextBtn.onclick = (e) => { e.stopPropagation(); playNext(); };
    const lPrevBtn = document.getElementById('lyrics-prev-btn');
    if (lPrevBtn) lPrevBtn.onclick = (e) => { e.stopPropagation(); playPrev(); };
    const lProgressBar = document.getElementById('lyrics-progress-container');
    if (lProgressBar) {
        lProgressBar.onclick = (e) => {
            const width = lProgressBar.clientWidth;
            const clickX = e.offsetX;
            const duration = audio.duration;
            if (duration && !isNaN(duration)) {
                audio.currentTime = (clickX / width) * duration;
                updateMobileProgress();
            }
        };
    }
    // Share/Shuffle in lyrics view footer
    const lShareFooter = document.getElementById('lyrics-share-btn-footer');
    if (lShareFooter) lShareFooter.onclick = () => {
        const s = (typeof songs !== 'undefined') ? songs[currentSongIndex] : null;
        if (s && navigator.share) {
            navigator.share({ title: s.title, text: `Check out ${s.title} lyrics!`, url: window.location.href }).catch(() => { });
        }
    };
    const lShuffleFooter = document.getElementById('lyrics-shuffle-btn-footer');
    if (lShuffleFooter) lShuffleFooter.onclick = () => {
        const mainShuffle = document.getElementById('shuffle-btn');
        if (mainShuffle) mainShuffle.click();
    };
    const lToggleFooter = document.getElementById('lyrics-footer-toggle-btn');
    if (lToggleFooter) lToggleFooter.onclick = (e) => {
        e.stopPropagation();
        toggleLyricsView();
    };
}
// Call on init
document.addEventListener('DOMContentLoaded', setupMobileControls);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setupMobileControls();
}
// Desktop Search Dropdown Renderer
function renderDesktopSearch(query) {
    const dropdown = document.getElementById('search-dropdown');
    if (!dropdown) return;
    dropdown.style.display = 'block';
    dropdown.innerHTML = '';
    let itemsToRender = [];
    if (!query || query.trim() === '') {
        // Show Recent Searches
        itemsToRender = recentSearches.slice(0, 5);
        if (itemsToRender.length === 0) {
            dropdown.innerHTML = '<div style="padding:15px; color:#888; font-size:13px; text-align:center;">No recent searches</div>';
            return;
        }
        // Maybe add a header "Recent"
    } else {
        // Filter Songs
        itemsToRender = songs.filter(s =>
            s.title.toLowerCase().includes(query.toLowerCase()) ||
            s.artist.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 8); // Limit to 8
        if (itemsToRender.length === 0) {
            dropdown.innerHTML = '<div style="padding:15px; color:#888; font-size:13px; text-align:center;">No results found</div>';
            return;
        }
    }
    itemsToRender.forEach(item => {
        const div = document.createElement('div');
        div.className = 'desktop-search-item';
        div.innerHTML = `
            <img src="${item.cover || item.image}" class="desktop-search-img ${item.type === 'Artist' ? 'round' : ''}">
            <div class="desktop-search-info">
                <div class="desktop-item-title">${item.title || item.name}</div>
                <div class="desktop-item-subtitle">${item.type || 'Song'} • ${item.artist || ''}</div>
            </div>
            <button class="desktop-item-add" title="Add to Library"><i class="fa-solid fa-circle-plus"></i></button>
        `;
        div.addEventListener('click', (e) => {
            if (e.target.closest('.desktop-item-add')) {
                e.stopPropagation();
                // Add to liked songs / library logic
                toggleLike(item);
                // Visual feedback?
                const btn = e.target.closest('.desktop-item-add');
                if (btn) btn.style.color = '#1db954';
                return;
            }
            addToRecent(item);
            if (item.type === 'Song' || !item.type) {
                playSong(item);
            } else if (item.type === 'Artist') {
                openArtistPage(item.name);
            } else if (item.type === 'Album') {
                openAlbum(item);
            }
            dropdown.style.display = 'none';
        });
        dropdown.appendChild(div);
    });
}
// Ensure Mini Player opens Full Screen on Click
document.addEventListener('DOMContentLoaded', () => {
    const miniPlayer = document.querySelector('.now-playing-mini');
    if (miniPlayer) {
        miniPlayer.addEventListener('click', (e) => {
            // Avoid triggering if clicked on buttons inside (play/like)
            if (e.target.closest('button')) return;
            // Open Mobile Player Overlay
            const overlay = document.getElementById('mobile-player-overlay');
            if (overlay) {
                overlay.classList.add('open');
                // Fix: Fetch current song safely to update UI on open
                let song = null;
                if (audio.dataset.currentSongId && typeof songs !== 'undefined') {
                    song = songs.find(s => String(s.id) === String(audio.dataset.currentSongId));
                }
                // Fallback removed to avoid overwriting with wrong song from index
                if (song) {
                    updateMobilePlayerUI(song);
                }
            }
        });
    }
});
// =========================================
// SYNCHRONOUS LYRICS IMPLEMENTATION
// =========================================
// Array of { time: seconds, text: string } and visibility state (moved to top)
// 1. Fetch Lyrics logic with Robust Multi-Strategy Fallback
async function fetchLyrics(song, manualSearchQuery = null) {
    const container = document.getElementById('lyrics-container');
    if (!container) return;
    // Show loading state with a more premium feel
    container.innerHTML = `
        <div class="lyrics-loading" style="text-align:center; padding: 60px 20px; color:#b3b3b3;">
            <div style="margin-bottom:20px; font-size:40px;"><i class="fa-solid fa-microphone-lines fa-bounce" style="color:var(--primary-color)"></i></div>
            <div style="font-size:18px; letter-spacing:1px; opacity:0.8;">FINDING LYRICS...</div>
            <div style="font-size:12px; margin-top:10px; opacity:0.5;">Searching across libraries</div>
        </div>
    `;
    currentLyrics = [];
    // Helper: Clean title and artists for API matching
    const cleanStr = (str) => {
        if (!str) return "";
        return str
            .replace(/\(From.*\)/i, '')
            .replace(/\(feat.*\)/i, '')
            .replace(/\(Prod.*\)/i, '')
            .replace(/\[.*\]/i, '')
            .replace(/\{.*\}/i, '')
            .replace(/'/g, '')
            .replace(/"/g, '')
            .trim();
    };
    // Check if there is specialized metadata for this song ID
    let title = manualSearchQuery;
    let fallbackArtists = (song.artist || "").split(/[&,]/).map(a => a.trim()).filter(a => a.length > 0);
    if (!manualSearchQuery) {
        // Try to find in lyricsMetadata (from data.js)
        const meta = (typeof lyricsMetadata !== 'undefined') ? lyricsMetadata.find(m => m.id === song.id) : null;
        if (meta) {
            title = meta.lrclibTitle;
            if (meta.lrclibArtist) fallbackArtists = [meta.lrclibArtist];
            console.log(`Using metadata for ID ${song.id}: "${title}" by ${fallbackArtists[0]}`);
        } else {
            title = cleanStr(song.title);
        }
    }
    const artists = fallbackArtists;
    const tryFetch = async (url) => {
        try {
            const resp = await fetch(url);
            if (resp.ok) {
                const data = await resp.json();
                // Ensure data is valid and has some lyrics
                if (data && (data.syncedLyrics || data.plainLyrics)) return data;
                if (Array.isArray(data) && data.length > 0) return data; // For search endpoint
            }
        } catch (e) {
            console.error("Fetch attempt failed:", url, e);
        }
        return null;
    };
    let result = null;
    console.log(`Lyrics search start: "${title}" by ${artists.join(", ")}`);
    // Strategy 1: Exact GET with Primary Artist
    if (!manualSearchQuery && artists.length > 0) {
        result = await tryFetch(`https://lrclib.net/api/get?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artists[0])}`);
    }
    // Strategy 2: SEARCH endpoint (Fuzzy Match)
    if (!result) {
        const query = manualSearchQuery || `${title} ${artists[0] || ""}`.trim();
        const searchResults = await tryFetch(`https://lrclib.net/api/search?q=${encodeURIComponent(query)}`);
        if (searchResults && searchResults.length > 0) {
            // First priority: Result with synced lyrics
            result = searchResults.find(item => item.syncedLyrics) || searchResults[0];
        }
    }
    // Strategy 3: Bollywood Normalization (Mein <-> Main)
    if (!result && (title.toLowerCase().includes('mein') || title.toLowerCase().includes('main'))) {
        let altTitle = title.replace(/\bMein\b/gi, 'Main').replace(/\bMain\b/gi, 'Mein');
        const query = `${altTitle} ${artists[0] || ""}`.trim();
        const searchResults = await tryFetch(`https://lrclib.net/api/search?q=${encodeURIComponent(query)}`);
        if (searchResults && searchResults.length > 0) {
            result = searchResults.find(item => item.syncedLyrics) || searchResults[0];
        }
    }
    // Strategy 4: SEARCH with just title (Broadest Match)
    if (!result && !manualSearchQuery) {
        const searchResults = await tryFetch(`https://lrclib.net/api/search?q=${encodeURIComponent(title)}`);
        if (searchResults && searchResults.length > 0) {
            // Try to find a result where the artist name overlaps with our artists
            result = searchResults.find(item => {
                const itemArtist = (item.artistName || "").toLowerCase();
                return artists.some(a => itemArtist.includes(a.toLowerCase()));
            }) || searchResults[0];
        }
    }
    // Final Rendering
    if (result && (result.syncedLyrics || result.plainLyrics)) {
        if (result.syncedLyrics) {
            currentLyrics = parseLRC(result.syncedLyrics);
            renderLyrics(currentLyrics);
        } else {
            // Plain lyrics fallback
            currentLyrics = [{ time: 0, text: result.plainLyrics.replace(/\n/g, '<br>') }];
            renderLyrics(currentLyrics, false);
        }
        // Instant update for mobile preview card
        updateMobileLyricsPreview();
    } else {
        container.innerHTML = `
            <div class="lyrics-error" style="text-align:center; padding: 60px 20px; color:#b3b3b3;">
                <div style="font-size:40px; margin-bottom:20px; opacity:0.3;"><i class="fa-solid fa-face-frown"></i></div>
                <div style="font-size:18px; margin-bottom:10px;">Lyrics not found</div>
                <div style="font-size:14px; opacity:0.6; max-width:300px; margin:0 auto 20px;">
                    We couldn't find lyrics for "${manualSearchQuery || song.title}" on the server.
                </div>
                <button onclick="promptManualLyrics()" style="background:var(--primary-color); border:none; color:white; padding:10px 20px; border-radius:30px; cursor:pointer; font-weight:600; font-size:13px; box-shadow:0 4px 15px rgba(176,38,255,0.3); transition: transform 0.2s;">
                   <i class="fa-solid fa-magnifying-glass" style="margin-right:8px;"></i> Search Manually
                </button>
            </div>
        `;
    }
}
// Manual Lyrics Search helper
window.promptManualLyrics = function () {
    const song = (typeof currentPlaylist !== 'undefined' && currentPlaylist[currentSongIndex]) || (typeof songs !== 'undefined' && songs[0]);
    if (!song) return;
    const query = prompt("Enter song name correctly (e.g. 'Tera Yaar Hoon Main'):", song.title);
    if (query) {
        fetchLyrics(song, query);
    }
};
// Hinglish Transliterator (Devanagari to Romanized)
function transliterateHindi(text) {
    if (!text || !/[\u0900-\u097F]/.test(text)) return text;
    const mapping = {
        'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
        'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
        'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
        'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
        'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
        'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
        'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
        'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', '्': '',
        'ं': 'n', 'ः': 'h', 'ँ': 'n', '।': '.', '॥': '.', '़': ''
    };
    let result = '';
    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        let nextChar = text[i + 1];
        if (mapping[char] !== undefined) {
            result += mapping[char];
            // Logic for "a" sound after consonants if no matra is present
            if (char >= 'क' && char <= 'ह') {
                if (!nextChar || (mapping[nextChar] === undefined) || (nextChar < 'ा' || nextChar > '्')) {
                    // Check if next is not a vowel sign or halant
                    const isVowelSign = nextChar && (nextChar >= 'ा' && nextChar <= '्');
                    if (!isVowelSign) {
                        // Avoid adding 'a' at the very end of words if it sounds silent
                        if (nextChar && nextChar !== ' ') {
                            result += 'a';
                        }
                    }
                }
            }
        } else {
            result += char;
        }
    }
    // Minor cleanups for natural Hinglish
    return result
        .replace(/aa/g, 'a') // "aa" is technically correct but "a" is more common for Hinglish
        .replace(/ee/g, 'i') // "ee" -> "i" is common
        .replace(/oo/g, 'u')
        .replace(/vn/g, 'wan') // specific phonetic fixes
        .replace(/\. \./g, '.')
        .trim();
}
// 2. Parse LRC logic
function parseLRC(lrcText) {
    const lines = lrcText.split('\n');
    const lyricsData = [];
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
    for (const line of lines) {
        const match = timeRegex.exec(line);
        if (match) {
            const minutes = parseInt(match[1], 10);
            const seconds = parseInt(match[2], 10);
            const millis = parseInt(match[3], 10);
            // Normalize millis (could be 2 or 3 digits)
            const millisNormalized = match[3].length === 2 ? millis * 10 : millis;
            const timeInSeconds = (minutes * 60) + seconds + (millisNormalized / 1000);
            const text = line.replace(timeRegex, '').trim();
            if (text) {
                lyricsData.push({ time: timeInSeconds, text });
            }
        }
    }
    return lyricsData;
}
// 3. Render lyrics logic
function renderLyrics(lyrics, synced = true) {
    const container = document.getElementById('lyrics-container');
    if (!container) return;
    container.innerHTML = '';
    if (lyrics.length === 0) {
        container.innerHTML = '<div class="lyrics-error" style="text-align:center; padding: 40px; color:#b3b3b3;">No lyrics found</div>';
        return;
    }
    if (!synced) {
        // Render unsynced plain lyrics
        const plainDiv = document.createElement('div');
        plainDiv.className = 'lyric-line plain-lyrics';
        plainDiv.style.color = '#fff';
        plainDiv.style.fontSize = '24px';
        plainDiv.style.lineHeight = '1.8';
        plainDiv.style.textAlign = 'center';
        plainDiv.innerHTML = transliterateHindi(lyrics[0].text);
        container.appendChild(plainDiv);
        return;
    }
    lyrics.forEach((lineData, index) => {
        const line = document.createElement('div');
        line.className = 'lyric-line';
        line.id = `lyric-line-${index}`; // Set ID for sync selection
        line.dataset.index = index;
        // Use Transliteration for Hindi content
        line.innerHTML = transliterateHindi(lineData.text);
        line.onclick = () => {
            audio.currentTime = lineData.time;
            updateMobileProgress();
        };
        container.appendChild(line);
    });
}
// 4. Sync lyrics during playback
function syncLyricsWithAudio() {
    const container = document.getElementById('lyrics-container');
    if (!container || !currentLyrics || currentLyrics.length <= 1) return;
    let activeIndex = -1;
    for (let i = 0; i < currentLyrics.length; i++) {
        if (audio.currentTime >= currentLyrics[i].time) {
            activeIndex = i;
        } else {
            break;
        }
    }
    if (activeIndex !== -1) {
        const activeLine = document.getElementById(`lyric-line-${activeIndex}`);
        if (activeLine && !activeLine.classList.contains('active')) {
            // Highlighting
            const allLines = container.querySelectorAll('.lyric-line');
            allLines.forEach(l => l.classList.remove('active'));
            activeLine.classList.add('active');
            // Auto-scroll logic (Centering)
            const scrollPos = activeLine.offsetTop - (container.clientHeight / 2) + (activeLine.clientHeight / 2);
            container.scrollTo({ top: scrollPos, behavior: 'smooth' });
        }
    }
}
// 5. Open toggle lyrics view logic
function toggleLyricsView() {
    const lView = document.getElementById('lyrics-view');
    const overlay = document.getElementById('mobile-player-overlay');
    const isMobilePlayerMode = overlay && overlay.classList.contains('open');
    const isMobileUI = window.innerWidth <= 768;
    if (!isLyricsViewOpen) {
        isLyricsViewOpen = true;
        // Visual feedback for mobile
        if (isMobilePlayerMode) {
            const mLyricsBtn = document.getElementById('mobile-lyrics-btn');
            if (mLyricsBtn) {
                mLyricsBtn.classList.add('tap-animate');
                setTimeout(() => mLyricsBtn.classList.remove('tap-animate'), 300);
            }
        }
        // Show the view
        if (lView) {
            lView.style.display = 'flex';
            // Force reflow
            lView.offsetHeight;
            lView.classList.add('open');
        }
        if (isMobilePlayerMode || isMobileUI) {
            document.body.classList.add('lyrics-sheet-open');
            const backdrop = document.getElementById('lyrics-backdrop');
            if (backdrop) backdrop.onclick = toggleLyricsView;
        } else {
            // Desktop Mode
            showView('lyrics');
            const rightSidebar = document.getElementById('right-sidebar');
            if (rightSidebar) rightSidebar.classList.add('collapsed');
            const lyricsBtn = document.getElementById('lyrics-btn');
            if (lyricsBtn) lyricsBtn.style.color = 'var(--primary-color)';
            document.body.style.overflow = 'hidden';
        }
        // Sync and Fetch
        let song = (typeof currentPlaylist !== 'undefined' && currentPlaylist[currentSongIndex]) ||
            (typeof songs !== 'undefined' && songs[0]);
        if (song) {
            updateMobilePlayerUI(song);
            if (typeof fetchLyrics === 'function') fetchLyrics(song);
        }
    } else {
        isLyricsViewOpen = false;
        if (lView) {
            lView.classList.remove('open');
            // Reset colors if needed
            const lyricsBtn = document.getElementById('lyrics-btn');
            if (lyricsBtn) lyricsBtn.style.color = '';
            // Hide after animation
            setTimeout(() => {
                if (!isLyricsViewOpen) lView.style.display = 'none';
            }, 600);
        }
        document.body.classList.remove('lyrics-sheet-open');
        document.body.style.overflow = '';
        // If we were in a view-state (desktop), return
        if (!isMobilePlayerMode && !isMobileUI) {
            goBack();
        }
    }
}
// Update hook in playSong to fetch new lyrics if view is open
if (typeof playSong === 'function') {
    const originalPlaySongLyricsHooks = playSong;
    playSong = function (song) {
        originalPlaySongLyricsHooks(song);
        if (isLyricsViewOpen) {
            fetchLyrics(song);
        }
    };
}
