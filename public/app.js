// =========================================
// PANGKALAN LPG - JavaScript App
// =========================================
let pelangganData = [];
let editingId = null;

function getIcon(name, extraClass = '') {
    const classes = ['icon', `icon-${name}`];
    if (extraClass) {
        classes.push(extraClass);
    }
    return `<svg class="${classes.join(' ')}" aria-hidden="true"><use href="#icon-${name}"></use></svg>`;
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    console.log('Pangkalan LPG App Started');

    // Setup event listeners
    setupEventListeners();

    // Load initial data
    loadPelanggan();

    // Focus search input on load for easy search
    setTimeout(() => {
        document.getElementById('searchInput')?.focus();
    }, 500);

    // Setup scroll event for FAB
    setupScrollListener();
});

async function fetchJSON(url, options = {}) {
    // Always include credentials for auth cookies
    options.credentials = 'same-origin';
    
    const res = await fetch(url, options);
    const ct = res.headers.get('content-type') || '';
    
    // Handle 401 - trigger login popup by reloading page
    if (res.status === 401) {
        showError('Sesi login habis. Memuat ulang halaman...');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
        throw new Error('Unauthorized - reloading for login');
    }
    
    if (!res.ok) {
        await res.text().catch(() => {});
        throw new Error(`HTTP ${res.status}`);
    }
    if (!ct.includes('application/json')) {
        throw new SyntaxError('Response bukan JSON');
    }
    return res.json();
}

function setupScrollListener() {
    const addSection = document.querySelector('.add-section');
    const floatingBtn = document.getElementById('floatingAddBtn');
    let lastScrollY = 0;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
        const fabTriggerPoint = 200; // Show FAB after scrolling down 200px

        if (currentScrollY > fabTriggerPoint) {
            // Hide regular add button, show FAB
            addSection.classList.add('hidden');
            floatingBtn.style.display = 'flex';
        } else {
            // Show regular add button, hide FAB
            addSection.classList.remove('hidden');
            floatingBtn.style.display = 'none';
        }

        lastScrollY = currentScrollY;
    });
}

function setupEventListeners() {
    // Add button
    document.getElementById('addBtn').addEventListener('click', showAddModal);

    // Form submission
    document.getElementById('pelangganForm').addEventListener('submit', handleSubmit);

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce(handleSearch, 300));

    // Month selector functionality
    const monthSelect = document.getElementById('monthSelect');
    if (monthSelect) {
        monthSelect.addEventListener('change', handleMonthChange);
        loadAvailableMonths();
    }

    // Close modal on outside click
    document.getElementById('modal').addEventListener('click', (e) => {
        if (e.target.id === 'modal') {
            closeModal();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    // Auto-format NIK input
    const nikInput = document.getElementById('nikPelanggan');
    if (nikInput) {
        nikInput.addEventListener('input', (e) => {
            // Only allow numbers
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    }
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// =========================================
// DATA LOADING FUNCTIONS
// =========================================
async function loadPelanggan(sheetName = null) {
    showLoading(true);
    hideEmptyState();

    try {
        const url = sheetName ? `/api/pelanggan/sheet/${encodeURIComponent(sheetName)}` : '/api/pelanggan';
        const result = await fetchJSON(url);

        if (result.success) {
            pelangganData = result.data;
            renderPelanggan();
            updateTotalCount(pelangganData.length);

            // Show success message if data loaded
            if (pelangganData.length > 0) {
                const sheetName = result.currentSheet || 'bulan ini';
                showSuccess(`Berhasil memuat ${pelangganData.length} data pelanggan dari ${sheetName}`);
            }
        } else {
            showError('Gagal memuat data: ' + result.error);
            showEmptyState();
        }
    } catch (error) {
        console.error('Load error:', error);
        showError('Tidak dapat menghubungi server. Periksa koneksi internet.');
        showEmptyState();
    } finally {
        showLoading(false);
    }
}

// =========================================
// RENDER FUNCTIONS
// =========================================
function renderPelanggan(filteredData = null) {
    const list = document.getElementById('pelangganList');
    const data = filteredData || pelangganData;

    if (data.length === 0) {
        list.innerHTML = '';
        if (filteredData) {
            list.innerHTML = `
                <div class="empty-search">
                    <div class="empty-search-icon">${getIcon('search')}</div>
                    <h3>Tidak ada hasil pencarian</h3>
                    <p>Coba kata kunci lain atau kosongkan pencarian</p>
                </div>
            `;
        } else {
            showEmptyState();
        }
        return;
    }

    hideEmptyState();

    list.innerHTML = data.map((pelanggan, index) => createPelangganCard(pelanggan, index)).join('');

    // Add animation to cards
    const cards = list.querySelectorAll('.pelanggan-card');
    cards.forEach((card, i) => {
        setTimeout(() => {
            card.style.animation = 'fadeInUp 0.5s ease forwards';
        }, i * 50);
    });
}

function createPelangganCard(pelanggan, index) {
    return `
        <div class="pelanggan-card" data-id="${pelanggan.id}">
            <div class="pelanggan-header">
                <div class="pelanggan-number">${index + 1}</div>
                <div class="pelanggan-actions">
                    <button class="btn-icon" onclick="editPelanggan('${pelanggan.id}')" title="Edit Data">
                        ${getIcon('edit')}
                    </button>
                    <button class="btn-icon delete" onclick="deletePelanggan('${pelanggan.id}')" title="Hapus Data">
                        ${getIcon('trash')}
                    </button>
                </div>
            </div>

            <div class="pelanggan-info">
                <div class="pelanggan-nama">${pelanggan.nama}</div>
                <div class="pelanggan-nik">
                    <span class="nik-text">${getIcon('id')} ${pelanggan.nik}</span>
                    <button class="nik-copy-btn" onclick="copyNIK('${pelanggan.nik}')" title="Copy NIK">
                        ${getIcon('copy')}
                    </button>
                </div>
                <div class="pelanggan-domisili">${getIcon('home')} ${pelanggan.domisili}</div>
            </div>

            <div class="minggu-container">
                <div class="minggu-title">MINGGU PENGAMBILAN GAS</div>
                <div class="minggu-grid">
                    ${[1, 2, 3, 4, 5].map(minggu => `
                        <div class="minggu-item">
                            <span class="minggu-label">
                                Minggu Ke-<span class="minggu-number">${minggu}</span>
                            </span>
                            <label class="toggle-switch">
                                <input
                                    type="checkbox"
                                    ${pelanggan['minggu' + minggu] ? 'checked' : ''}
                                    onchange="toggleMinggu('${pelanggan.id}', ${minggu}, this.checked)"
                                >
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// =========================================
// MODAL FUNCTIONS
// =========================================
function showAddModal() {
    editingId = null;
    document.getElementById('modalTitleText').textContent = 'Tambah Pelanggan Baru';
    document.getElementById('pelangganForm').reset();
    document.getElementById('modal').classList.add('active');

    // Focus on first input
    setTimeout(() => {
        document.getElementById('namaPelanggan').focus();
    }, 300);
}

function editPelanggan(id) {
    const pelanggan = pelangganData.find(p => p.id === id);
    if (!pelanggan) {
        showError('Data pelanggan tidak ditemukan');
        return;
    }

    editingId = id;
    document.getElementById('modalTitleText').textContent = 'Edit Data Pelanggan';
    document.getElementById('namaPelanggan').value = pelanggan.nama;
    document.getElementById('nikPelanggan').value = pelanggan.nik;
    document.getElementById('domisiliPelanggan').value = pelanggan.domisili;
    document.getElementById('modal').classList.add('active');

    // Focus on first input
    setTimeout(() => {
        document.getElementById('namaPelanggan').focus();
    }, 300);
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
    document.getElementById('pelangganForm').reset();
    editingId = null;

    // Return focus to search
    setTimeout(() => {
        document.getElementById('searchInput').focus();
    }, 300);
}

// =========================================
// FORM HANDLERS
// =========================================
async function handleSubmit(e) {
    e.preventDefault();

    const nama = document.getElementById('namaPelanggan').value.trim();
    const nik = document.getElementById('nikPelanggan').value.trim();
    const domisili = document.getElementById('domisiliPelanggan').value.trim();

    // Validation
    if (!nama || !nik || !domisili) {
        showError('Nama, NIK, dan Domisili harus diisi lengkap!');
        return;
    }

    if (nik.length !== 16) {
        showError('NIK harus tepat 16 digit angka!');
        document.getElementById('nikPelanggan').focus();
        return;
    }

    if (!/^\d+$/.test(nik)) {
        showError('NIK hanya boleh angka!');
        document.getElementById('nikPelanggan').focus();
        return;
    }

    // Check for duplicate NIK (except when editing)
    const isDuplicate = pelangganData.some(p =>
        p.nik === nik && p.id !== editingId
    );

    if (isDuplicate) {
        showError('NIK ini sudah terdaftar! Gunakan NIK yang berbeda.');
        document.getElementById('nikPelanggan').focus();
        return;
    }

    showLoading(true);

    try {
        const url = editingId ? `/api/pelanggan/${editingId}` : '/api/pelanggan';
        const method = editingId ? 'PUT' : 'POST';

        const result = await fetchJSON(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nama, nik, domisili })
        });

        if (result.success) {
            closeModal();
            await loadPelanggan();
            showSuccess(editingId ? 'Data berhasil diupdate!' : result.message || 'Pelanggan berhasil ditambahkan!');
        } else {
            showError(result.error || 'Gagal menyimpan data. Silakan coba lagi.');
        }
    } catch (error) {
        console.error('Save error:', error);
        showError('Terjadi kesalahan. Periksa koneksi internet dan coba lagi.');
    } finally {
        showLoading(false);
    }
}

// =========================================
// DELETE FUNCTIONS
// =========================================
async function deletePelanggan(id) {
    const pelanggan = pelangganData.find(p => p.id === id);
    if (!pelanggan) return;

    // Better confirmation message with customer info
    if (!confirm(`Hapus data pelanggan berikut?\n\nNama: ${pelanggan.nama}\nNIK: ${pelanggan.nik}\n\nData yang dihapus tidak dapat dikembalikan!`)) {
        return;
    }

    // Additional confirmation for safety
    if (!confirm('YAKIN akan menghapus data ini?')) {
        return;
    }

    showLoading(true);

    try {
        const result = await fetchJSON(`/api/pelanggan/${id}`, {
            method: 'DELETE'
        });

        if (result.success) {
            await loadPelanggan();
            showSuccess(result.message || 'Data berhasil dihapus!');
        } else {
            showError(result.error || 'Gagal menghapus data');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showError('Terjadi kesalahan. Coba lagi nanti.');
    } finally {
        showLoading(false);
    }
}

// =========================================
// WEEKLY TOGGLE FUNCTIONS
// =========================================
async function toggleMinggu(id, minggu, checked) {
    const mingguText = `Minggu ke-${minggu}`;

    try {
        const result = await fetchJSON(`/api/pelanggan/${id}/minggu/${minggu}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ checked })
        });

        if (result.success) {
            // Update local data
            const pelanggan = pelangganData.find(p => p.id === id);
            if (pelanggan) {
                pelanggan['minggu' + minggu] = checked;

                // Show subtle feedback
                if (checked) {
                    showSuccess(`${mingguText} berhasil ditandai!`);
                }
            }
        } else {
            showError('Gagal update: ' + result.error);
            // Revert checkbox
            event.target.checked = !checked;
        }
    } catch (error) {
        console.error('Toggle error:', error);
        showError('Terjadi kesalahan. Coba lagi.');
        // Revert checkbox
        event.target.checked = !checked;
    }
}

// =========================================
// SEARCH FUNCTIONS
// =========================================
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();

    if (!query) {
        renderPelanggan();
        return;
    }

    const filtered = pelangganData.filter(p => {
        const searchInNama = p.nama.toLowerCase().includes(query);
        const searchInNik = p.nik.includes(query);
        return searchInNama || searchInNik;
    });

    renderPelanggan(filtered);
}

// =========================================
// UI HELPER FUNCTIONS
// =========================================
function updateTotalCount(count) {
    const totalElement = document.getElementById('totalCount');
    if (totalElement) {
        totalElement.textContent = count;
    }
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.add('active');
    } else {
        loading.classList.remove('active');
    }
}

function showEmptyState() {
    const emptyState = document.getElementById('emptyState');
    if (emptyState) {
        emptyState.classList.add('active');
    }
}

function hideEmptyState() {
    const emptyState = document.getElementById('emptyState');
    if (emptyState) {
        emptyState.classList.remove('active');
    }
   }

function showSuccess(message) {
    showMessage(message, 'success');
}

function showError(message) {
    showMessage(message, 'error');
}

function showMessage(message, type) {
    const messageBox = document.getElementById('messageBox');
    if (!messageBox) return;

    messageBox.textContent = message;
    messageBox.className = `message-box ${type} show`;

    // Auto hide after 4 seconds
    setTimeout(() => {
        messageBox.classList.remove('show');
    }, 4000);
}

// =========================================
// UTILITY FUNCTIONS
// =========================================
function formatNIK(nik) {
    // Format NIK with spaces for better readability
    if (nik.length === 16) {
        return `${nik.slice(0, 6)} ${nik.slice(6, 12)} ${nik.slice(12)}`;
    }
    return nik;
}

// =========================================
// UTILITY FUNCTIONS
// =========================================
function copyNIK(nik) {
    // Create temporary input element
    const tempInput = document.createElement('input');
    tempInput.value = nik;
    tempInput.style.cssText = 'position: absolute; left: -9999px; top: -9999px;';

    document.body.appendChild(tempInput);
    tempInput.select();
    tempInput.setSelectionRange(0, 16); // For mobile

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showSuccess(`NIK ${nik} berhasil disalin!`);
        } else {
            throw new Error('Copy command failed');
        }
    } catch (err) {
        // Fallback for modern browsers
        if (navigator.clipboard) {
            navigator.clipboard.writeText(nik).then(() => {
                showSuccess(`NIK ${nik} berhasil disalin!`);
            }).catch((error) => {
                showError('Gagal menyalin NIK');
            });
        } else {
            showError('Browser tidak support copy');
        }
    } finally {
        document.body.removeChild(tempInput);
    }
}

function isValidNIK(nik) {
    // Basic NIK validation
    return /^\d{16}$/.test(nik);
}

// =========================================
// ERROR HANDLING
// =========================================
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
    showError('Terjadi kesalahan pada aplikasi. Refresh halaman dan coba lagi.');
});

// =========================================
// ANIMATION STYLES
// =========================================
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;
document.head.appendChild(style);

// =========================================
// MONTH SELECTION FUNCTIONS
// =========================================

async function loadAvailableMonths() {
    try {
        const result = await fetchJSON('/api/sheets');
        
        if (result.success && result.data) {
            const monthSelect = document.getElementById('monthSelect');
            monthSelect.innerHTML = '';
            
            const currentMonth = new Date();
            const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                              'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            const currentSheetName = `Pelanggan ${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
            
            // Sort sheets: current month first, then by date
            const sortedSheets = result.data.sort((a, b) => {
                if (a.title === currentSheetName) return -1;
                if (b.title === currentSheetName) return 1;
                return a.title.localeCompare(b.title, 'id-ID', { numeric: true, sensitivity: 'base' });
            });
            
            sortedSheets.forEach(sheet => {
                const option = document.createElement('option');
                option.value = sheet.title;
                option.textContent = sheet.title.replace('Pelanggan ', '');
                
                if (sheet.title === currentSheetName) {
                    option.selected = true;
                }
                
                monthSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading available months:', error);
        showError('Gagal memuat daftar bulan');
    }
}

function handleMonthChange(event) {
    const selectedSheet = event.target.value;
    if (selectedSheet) {
        loadPelanggan(selectedSheet);
    }
}

// =========================================
// CONSOLE INFO
// =========================================
console.log('Pangkalan LPG v1.0');
console.log('Siap untuk mencatat data pelanggan!');
