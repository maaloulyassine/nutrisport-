// ===== Advanced Barcode Scanner with Camera & Upload =====

let barcodeStream = null;
let scannerActive = false;
let scanInterval = null;
let lastScannedCode = null;
let scanAttempts = 0;

// Initialize barcode scanner
function initBarcodeScanner() {
    // Check BarcodeDetector support
    if (!('BarcodeDetector' in window)) {
        console.log('BarcodeDetector not supported, will use fallback');
    }
}

// Open scanner modal with improved UI
function openBarcodeScanner() {
    const modalHtml = `
        <div class="modal fade" id="barcodeScannerModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-barcode"></i> Scanner Code-Barres
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <!-- Tabs pour Camera / Upload / Manuel -->
                        <ul class="nav nav-tabs mb-3" role="tablist">
                            <li class="nav-item" role="presentation">
                                <button class="nav-link active" id="camera-tab" data-bs-toggle="tab" data-bs-target="#cameraPane" type="button">
                                    <i class="fas fa-camera"></i> Caméra
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="upload-tab" data-bs-toggle="tab" data-bs-target="#uploadPane" type="button">
                                    <i class="fas fa-upload"></i> Upload Image
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="manual-tab" data-bs-toggle="tab" data-bs-target="#manualPane" type="button">
                                    <i class="fas fa-keyboard"></i> Manuel
                                </button>
                            </li>
                        </ul>
                        
                        <div class="tab-content">
                            <!-- Camera Tab -->
                            <div class="tab-pane fade show active" id="cameraPane" role="tabpanel">
                                <div id="scannerContainer" class="position-relative text-center mb-3">
                                    <video id="barcodeVideo" class="w-100 rounded" style="max-height: 350px; background: #000; object-fit: cover;"></video>
                                    
                                    <!-- Scanner Overlay with targeting box -->
                                    <div id="scannerOverlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none;">
                                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80%; max-width: 300px; height: 100px; border: 3px solid #00ff00; border-radius: 10px; box-shadow: 0 0 0 9999px rgba(0,0,0,0.5);">
                                            <div id="scanLine" style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #00ff00, transparent); animation: scanAnimation 2s infinite;"></div>
                                        </div>
                                    </div>
                                    
                                    <!-- Status indicator -->
                                    <div id="scanStatus" class="position-absolute bottom-0 start-50 translate-middle-x mb-2">
                                        <span class="badge bg-warning">
                                            <i class="fas fa-spinner fa-spin"></i> Recherche de code-barres...
                                        </span>
                                    </div>
                                </div>
                                
                                <!-- Camera controls -->
                                <div class="d-flex justify-content-center gap-2 mb-3">
                                    <button class="btn btn-outline-primary" onclick="switchCamera()">
                                        <i class="fas fa-sync-alt"></i> Changer caméra
                                    </button>
                                    <button class="btn btn-outline-success" onclick="toggleFlash()">
                                        <i class="fas fa-bolt"></i> Flash
                                    </button>
                                </div>
                                
                                <div class="alert alert-info small">
                                    <i class="fas fa-info-circle"></i> 
                                    Placez le code-barres dans le cadre vert. Le scan est automatique.
                                </div>
                            </div>
                            
                            <!-- Upload Tab -->
                            <div class="tab-pane fade" id="uploadPane" role="tabpanel">
                                <div class="text-center p-4">
                                    <div id="uploadDropZone" class="border border-3 border-dashed rounded p-5 mb-3" 
                                         style="border-color: #6c757d; cursor: pointer; transition: all 0.3s;"
                                         ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event)">
                                        <i class="fas fa-cloud-upload-alt fa-4x text-muted mb-3"></i>
                                        <h5>Glissez une image ici</h5>
                                        <p class="text-muted">ou cliquez pour sélectionner</p>
                                        <input type="file" id="barcodeImageInput" accept="image/*" class="d-none" onchange="handleBarcodeImageUpload(event)">
                                        <button class="btn btn-primary" onclick="document.getElementById('barcodeImageInput').click()">
                                            <i class="fas fa-image"></i> Choisir une image
                                        </button>
                                    </div>
                                    
                                    <!-- Preview -->
                                    <div id="uploadPreview" class="d-none mb-3">
                                        <img id="uploadedBarcodeImage" class="img-fluid rounded" style="max-height: 200px;">
                                        <div id="uploadScanStatus" class="mt-2">
                                            <span class="badge bg-info">
                                                <i class="fas fa-spinner fa-spin"></i> Analyse en cours...
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Manual Tab -->
                            <div class="tab-pane fade" id="manualPane" role="tabpanel">
                                <div class="p-3">
                                    <label class="form-label">Entrez le code-barres manuellement :</label>
                                    <div class="input-group input-group-lg mb-3">
                                        <span class="input-group-text"><i class="fas fa-barcode"></i></span>
                                        <input type="text" id="manualBarcode" class="form-control" 
                                               placeholder="Ex: 3017620422003" 
                                               pattern="[0-9]*" inputmode="numeric"
                                               onkeypress="if(event.key==='Enter')searchBarcode(this.value)">
                                        <button class="btn btn-primary" onclick="searchBarcode(document.getElementById('manualBarcode').value)">
                                            <i class="fas fa-search"></i> Rechercher
                                        </button>
                                    </div>
                                    <div class="alert alert-secondary small">
                                        <i class="fas fa-info-circle"></i> 
                                        Le code-barres se trouve sous le code visuel (13 chiffres pour EAN-13)
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Result (shared between all tabs) -->
                        <div id="barcodeResult" class="d-none mt-3">
                            <div class="card border-success">
                                <div class="card-header bg-success text-white">
                                    <i class="fas fa-check-circle"></i> Produit trouvé !
                                </div>
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-3 text-center">
                                            <img id="productImage" src="" class="img-fluid rounded" style="max-height: 120px;">
                                        </div>
                                        <div class="col-md-9">
                                            <h5 id="productName" class="mb-1"></h5>
                                            <p id="productBrand" class="text-muted mb-2"></p>
                                            <div class="row text-center g-2">
                                                <div class="col-3">
                                                    <div class="bg-danger bg-opacity-10 rounded p-2">
                                                        <span class="fs-5 fw-bold text-danger" id="productCalories">0</span>
                                                        <small class="d-block text-muted">kcal</small>
                                                    </div>
                                                </div>
                                                <div class="col-3">
                                                    <div class="bg-primary bg-opacity-10 rounded p-2">
                                                        <span class="fs-5 fw-bold text-primary" id="productProteins">0</span>
                                                        <small class="d-block text-muted">Prot.</small>
                                                    </div>
                                                </div>
                                                <div class="col-3">
                                                    <div class="bg-warning bg-opacity-10 rounded p-2">
                                                        <span class="fs-5 fw-bold text-warning" id="productCarbs">0</span>
                                                        <small class="d-block text-muted">Gluc.</small>
                                                    </div>
                                                </div>
                                                <div class="col-3">
                                                    <div class="bg-info bg-opacity-10 rounded p-2">
                                                        <span class="fs-5 fw-bold text-info" id="productFats">0</span>
                                                        <small class="d-block text-muted">Lip.</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="card-footer">
                                    <div class="row g-2 align-items-center">
                                        <div class="col-auto">
                                            <label class="form-label mb-0">Quantité :</label>
                                        </div>
                                        <div class="col-auto">
                                            <div class="input-group">
                                                <button class="btn btn-outline-secondary" onclick="adjustQuantity(-10)">-</button>
                                                <input type="number" id="productQuantity" class="form-control text-center" value="100" min="1" style="width: 80px;">
                                                <button class="btn btn-outline-secondary" onclick="adjustQuantity(10)">+</button>
                                                <span class="input-group-text">g</span>
                                            </div>
                                        </div>
                                        <div class="col">
                                            <button class="btn btn-success w-100" onclick="addScannedProduct()">
                                                <i class="fas fa-plus-circle"></i> Ajouter au journal
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Loading -->
                        <div id="scannerLoading" class="text-center d-none py-4">
                            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
                            <p class="mt-3 mb-0">Recherche du produit dans Open Food Facts...</p>
                        </div>
                        
                        <!-- Error -->
                        <div id="scannerError" class="alert alert-warning d-none mt-3">
                            <i class="fas fa-exclamation-triangle"></i>
                            <span id="scannerErrorMsg"></span>
                            <button class="btn btn-sm btn-outline-warning ms-2" onclick="resetScanner()">Réessayer</button>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <small class="text-muted me-auto">
                            <i class="fas fa-database"></i> Données: Open Food Facts
                        </small>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
            @keyframes scanAnimation {
                0%, 100% { top: 0; opacity: 1; }
                50% { top: calc(100% - 2px); opacity: 0.5; }
            }
            #uploadDropZone:hover, #uploadDropZone.dragover {
                border-color: #0d6efd !important;
                background-color: rgba(13, 110, 253, 0.05);
            }
        </style>
    `;
    
    // Remove existing modal
    const existing = document.getElementById('barcodeScannerModal');
    if (existing) existing.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modal = new bootstrap.Modal(document.getElementById('barcodeScannerModal'));
    modal.show();
    
    // Reset state
    lastScannedCode = null;
    scanAttempts = 0;
    
    // Start camera when modal opens
    document.getElementById('barcodeScannerModal').addEventListener('shown.bs.modal', startCamera);
    document.getElementById('barcodeScannerModal').addEventListener('hidden.bs.modal', stopCamera);
    
    // Handle tab changes
    document.querySelectorAll('#barcodeScannerModal [data-bs-toggle="tab"]').forEach(tab => {
        tab.addEventListener('shown.bs.tab', (e) => {
            if (e.target.id === 'camera-tab') {
                startCamera();
            } else {
                stopCamera();
            }
        });
    });
}

// Current camera facing mode
let currentFacingMode = 'environment';
let flashEnabled = false;

// Start camera with improved settings
async function startCamera() {
    try {
        const video = document.getElementById('barcodeVideo');
        if (!video) return;
        
        // Stop existing stream first
        stopCamera();
        
        // Request camera with higher resolution for better detection
        const constraints = {
            video: {
                facingMode: currentFacingMode,
                width: { ideal: 1920, min: 1280 },
                height: { ideal: 1080, min: 720 }
            }
        };
        
        barcodeStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = barcodeStream;
        
        // Wait for video to be ready
        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play();
                resolve();
            };
        });
        
        scannerActive = true;
        updateScanStatus('scanning');
        
        // Start continuous scanning
        startContinuousScan();
        
    } catch (error) {
        console.error('Camera error:', error);
        updateScanStatus('error', 'Impossible d\'accéder à la caméra. Utilisez l\'upload ou la saisie manuelle.');
    }
}

// Switch between front and back camera
async function switchCamera() {
    currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    await startCamera();
    showToast(`📷 Caméra ${currentFacingMode === 'environment' ? 'arrière' : 'frontale'}`, 'info');
}

// Toggle flash (if available)
async function toggleFlash() {
    if (!barcodeStream) return;
    
    const track = barcodeStream.getVideoTracks()[0];
    const capabilities = track.getCapabilities ? track.getCapabilities() : {};
    
    if (capabilities.torch) {
        flashEnabled = !flashEnabled;
        await track.applyConstraints({
            advanced: [{ torch: flashEnabled }]
        });
        showToast(flashEnabled ? '💡 Flash activé' : '🔦 Flash désactivé', 'info');
    } else {
        showToast('⚠️ Flash non disponible sur cette caméra', 'warning');
    }
}

// Stop camera
function stopCamera() {
    scannerActive = false;
    if (scanInterval) {
        clearInterval(scanInterval);
        scanInterval = null;
    }
    if (barcodeStream) {
        barcodeStream.getTracks().forEach(track => track.stop());
        barcodeStream = null;
    }
}

// Start continuous barcode scanning
function startContinuousScan() {
    if (scanInterval) clearInterval(scanInterval);
    
    // Scan every 200ms for smoother detection
    scanInterval = setInterval(async () => {
        if (!scannerActive) return;
        await scanForBarcode();
    }, 200);
}

// Scan for barcode using BarcodeDetector API with fallback
async function scanForBarcode() {
    if (!scannerActive) return;
    
    const video = document.getElementById('barcodeVideo');
    if (!video || video.readyState !== 4) return;
    
    scanAttempts++;
    
    // Check if BarcodeDetector is available
    if ('BarcodeDetector' in window) {
        try {
            const barcodeDetector = new BarcodeDetector({
                formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code']
            });
            
            const barcodes = await barcodeDetector.detect(video);
            
            if (barcodes.length > 0) {
                const barcode = barcodes[0].rawValue;
                
                // Avoid duplicate scans
                if (barcode === lastScannedCode) return;
                lastScannedCode = barcode;
                
                console.log('📷 Barcode detected:', barcode);
                
                // Visual feedback
                updateScanStatus('found', barcode);
                
                // Vibrate if supported
                if (navigator.vibrate) {
                    navigator.vibrate(200);
                }
                
                // Stop scanning and search
                stopCamera();
                searchBarcode(barcode);
            }
        } catch (error) {
            // Continue scanning on error
        }
    } else {
        // Fallback message
        if (scanAttempts === 1) {
            updateScanStatus('info', 'Votre navigateur ne supporte pas la détection automatique. Utilisez l\'upload ou la saisie manuelle.');
        }
    }
}

// Update scan status display
function updateScanStatus(status, message = '') {
    const statusEl = document.getElementById('scanStatus');
    const errorEl = document.getElementById('scannerError');
    
    if (!statusEl) return;
    
    switch(status) {
        case 'scanning':
            statusEl.innerHTML = `<span class="badge bg-warning"><i class="fas fa-spinner fa-spin"></i> Recherche de code-barres...</span>`;
            statusEl.classList.remove('d-none');
            errorEl?.classList.add('d-none');
            break;
        case 'found':
            statusEl.innerHTML = `<span class="badge bg-success"><i class="fas fa-check-circle"></i> Code trouvé: ${message}</span>`;
            break;
        case 'error':
            statusEl.classList.add('d-none');
            if (errorEl) {
                errorEl.classList.remove('d-none');
                document.getElementById('scannerErrorMsg').textContent = message;
            }
            break;
        case 'info':
            statusEl.innerHTML = `<span class="badge bg-info"><i class="fas fa-info-circle"></i> ${message}</span>`;
            break;
    }
}

// ===== IMAGE UPLOAD HANDLING =====

// Handle drag over
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

// Handle drag leave
function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
}

// Handle drop
function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processBarcodeImage(files[0]);
    }
}

// Handle barcode image upload
function handleBarcodeImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        processBarcodeImage(file);
    }
}

// Process uploaded barcode image
async function processBarcodeImage(file) {
    if (!file.type.startsWith('image/')) {
        showToast('❌ Veuillez sélectionner une image', 'error');
        return;
    }
    
    // Show preview
    const previewContainer = document.getElementById('uploadPreview');
    const previewImg = document.getElementById('uploadedBarcodeImage');
    const statusEl = document.getElementById('uploadScanStatus');
    
    if (!previewContainer) return;
    
    previewContainer.classList.remove('d-none');
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        previewImg.src = e.target.result;
        statusEl.innerHTML = `<span class="badge bg-info"><i class="fas fa-spinner fa-spin"></i> Analyse en cours...</span>`;
        
        // Create image element for detection
        const img = new Image();
        img.onload = async () => {
            // Try BarcodeDetector on the image
            if ('BarcodeDetector' in window) {
                try {
                    const barcodeDetector = new BarcodeDetector({
                        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code']
                    });
                    
                    const barcodes = await barcodeDetector.detect(img);
                    
                    if (barcodes.length > 0) {
                        const barcode = barcodes[0].rawValue;
                        statusEl.innerHTML = `<span class="badge bg-success"><i class="fas fa-check-circle"></i> Code détecté: ${barcode}</span>`;
                        
                        // Vibrate
                        if (navigator.vibrate) navigator.vibrate(200);
                        
                        // Search the product
                        searchBarcode(barcode);
                    } else {
                        statusEl.innerHTML = `<span class="badge bg-warning"><i class="fas fa-exclamation-triangle"></i> Aucun code-barres détecté. Essayez avec une image plus nette.</span>`;
                    }
                } catch (error) {
                    statusEl.innerHTML = `<span class="badge bg-danger"><i class="fas fa-times-circle"></i> Erreur de détection</span>`;
                }
            } else {
                statusEl.innerHTML = `<span class="badge bg-warning"><i class="fas fa-exclamation-triangle"></i> Détection non supportée. Utilisez la saisie manuelle.</span>`;
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Adjust quantity with +/- buttons
function adjustQuantity(delta) {
    const input = document.getElementById('productQuantity');
    if (!input) return;
    let value = parseInt(input.value) || 100;
    value = Math.max(1, value + delta);
    input.value = value;
}

// Reset scanner to try again
function resetScanner() {
    const errorEl = document.getElementById('scannerError');
    const resultEl = document.getElementById('barcodeResult');
    const manualInput = document.getElementById('manualBarcode');
    
    if (errorEl) errorEl.classList.add('d-none');
    if (resultEl) resultEl.classList.add('d-none');
    if (manualInput) manualInput.value = '';
    
    lastScannedCode = null;
    scanAttempts = 0;
    
    // Restart camera if on camera tab
    const cameraTab = document.getElementById('camera-tab');
    if (cameraTab && cameraTab.classList.contains('active')) {
        startCamera();
    }
}

// Search product by barcode using Open Food Facts
async function searchBarcode(barcode) {
    if (!barcode || barcode.length < 8) {
        showScannerError('Code-barres invalide');
        return;
    }
    
    // Show loading
    document.getElementById('scannerLoading').classList.remove('d-none');
    document.getElementById('barcodeResult').classList.add('d-none');
    document.getElementById('scannerError').classList.add('d-none');
    
    try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
        const data = await response.json();
        
        document.getElementById('scannerLoading').classList.add('d-none');
        
        if (data.status === 1 && data.product) {
            displayProduct(data.product, barcode);
        } else {
            showScannerError('Produit non trouvé dans la base de données Open Food Facts');
        }
    } catch (error) {
        console.error('API error:', error);
        document.getElementById('scannerLoading').classList.add('d-none');
        showScannerError('Erreur de connexion. Vérifiez votre internet.');
    }
}

// Display product info
function displayProduct(product, barcode) {
    const nutrients = product.nutriments || {};
    
    // Store current product for adding
    window.currentScannedProduct = {
        barcode: barcode,
        name: product.product_name || 'Produit inconnu',
        brand: product.brands || '',
        image: product.image_url || product.image_front_url || '',
        calories: Math.round(nutrients['energy-kcal_100g'] || nutrients['energy-kcal'] || 0),
        proteins: Math.round((nutrients.proteins_100g || nutrients.proteins || 0) * 10) / 10,
        carbs: Math.round((nutrients.carbohydrates_100g || nutrients.carbohydrates || 0) * 10) / 10,
        fats: Math.round((nutrients.fat_100g || nutrients.fat || 0) * 10) / 10
    };
    
    // Update UI
    document.getElementById('productName').textContent = window.currentScannedProduct.name;
    document.getElementById('productBrand').textContent = window.currentScannedProduct.brand;
    document.getElementById('productImage').src = window.currentScannedProduct.image || 'https://via.placeholder.com/100?text=No+Image';
    document.getElementById('productCalories').textContent = window.currentScannedProduct.calories;
    document.getElementById('productProteins').textContent = window.currentScannedProduct.proteins + 'g';
    document.getElementById('productCarbs').textContent = window.currentScannedProduct.carbs + 'g';
    document.getElementById('productFats').textContent = window.currentScannedProduct.fats + 'g';
    
    document.getElementById('barcodeResult').classList.remove('d-none');
}

// Add scanned product to diary
function addScannedProduct() {
    const product = window.currentScannedProduct;
    if (!product) return;
    
    const quantity = parseInt(document.getElementById('productQuantity').value) || 100;
    const ratio = quantity / 100;
    
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const today = new Date().toISOString().split('T')[0];
    const diaryKey = `foodDiary_${user.email}`;
    
    let diary = JSON.parse(localStorage.getItem(diaryKey) || '{}');
    if (!diary[today]) diary[today] = [];
    
    const meal = {
        id: Date.now(),
        name: product.name + (product.brand ? ` (${product.brand})` : ''),
        category: 'snack',
        calories: Math.round(product.calories * ratio),
        proteins: Math.round(product.proteins * ratio * 10) / 10,
        carbs: Math.round(product.carbs * ratio * 10) / 10,
        fats: Math.round(product.fats * ratio * 10) / 10,
        quantity: quantity,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        source: 'barcode-scan',
        barcode: product.barcode
    };
    
    diary[today].push(meal);
    localStorage.setItem(diaryKey, JSON.stringify(diary));
    
    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('barcodeScannerModal')).hide();
    
    // Show success
    showToast(`✅ ${product.name} ajouté au journal !`, 'success');
    
    // Refresh page if on food-diary
    if (window.location.href.includes('food-diary')) {
        location.reload();
    }
}

// Show error
function showScannerError(message) {
    document.getElementById('scannerError').classList.remove('d-none');
    document.getElementById('scannerErrorMsg').textContent = message;
}

// Toast notification
function showToast(message, type = 'info') {
    if (window.showToast) {
        window.showToast(message, type);
        return;
    }
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'primary'} border-0 position-fixed bottom-0 end-0 m-3`;
    toast.style.zIndex = '9999';
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    document.body.appendChild(toast);
    new bootstrap.Toast(toast).show();
    setTimeout(() => toast.remove(), 3000);
}

// Add scanner button to food diary
function addScannerButton() {
    const container = document.querySelector('.container');
    if (!container) return;
    
    const header = container.querySelector('h1, .display-5');
    if (!header) return;
    
    const existingBtn = document.getElementById('scannerBtn');
    if (existingBtn) return;
    
    const btn = document.createElement('button');
    btn.id = 'scannerBtn';
    btn.className = 'btn btn-warning ms-3';
    btn.innerHTML = '<i class="fas fa-barcode"></i> Scanner';
    btn.onclick = openBarcodeScanner;
    
    header.parentNode.appendChild(btn);
}

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
    initBarcodeScanner();
    if (window.location.href.includes('food-diary') || window.location.href.includes('chatbot')) {
        setTimeout(addScannerButton, 500);
    }
});

// Export
window.barcodeScanner = {
    open: openBarcodeScanner,
    search: searchBarcode
};
