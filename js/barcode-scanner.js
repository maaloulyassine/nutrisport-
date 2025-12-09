// ===== Barcode Scanner with Open Food Facts API =====

let barcodeStream = null;
let scannerActive = false;

// Initialize barcode scanner
function initBarcodeScanner() {
    console.log('📷 Barcode Scanner initialized');
}

// Open scanner modal
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
                        <!-- Camera View -->
                        <div id="scannerContainer" class="text-center mb-3">
                            <video id="barcodeVideo" class="w-100 rounded" style="max-height: 300px; background: #000;"></video>
                            <div id="scannerOverlay" class="scanner-overlay">
                                <div class="scanner-line"></div>
                            </div>
                        </div>
                        
                        <!-- Manual Input -->
                        <div class="input-group mb-3">
                            <span class="input-group-text"><i class="fas fa-keyboard"></i></span>
                            <input type="text" id="manualBarcode" class="form-control" placeholder="Ou entrez le code-barres manuellement...">
                            <button class="btn btn-primary" onclick="searchBarcode(document.getElementById('manualBarcode').value)">
                                <i class="fas fa-search"></i> Rechercher
                            </button>
                        </div>
                        
                        <!-- Result -->
                        <div id="barcodeResult" class="d-none">
                            <div class="card">
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-3 text-center">
                                            <img id="productImage" src="" class="img-fluid rounded" style="max-height: 100px;">
                                        </div>
                                        <div class="col-md-9">
                                            <h5 id="productName" class="mb-2"></h5>
                                            <p id="productBrand" class="text-muted mb-2"></p>
                                            <div class="row text-center">
                                                <div class="col-3">
                                                    <span class="badge bg-danger fs-6" id="productCalories">0</span>
                                                    <small class="d-block">kcal</small>
                                                </div>
                                                <div class="col-3">
                                                    <span class="badge bg-primary fs-6" id="productProteins">0</span>
                                                    <small class="d-block">Protéines</small>
                                                </div>
                                                <div class="col-3">
                                                    <span class="badge bg-warning fs-6" id="productCarbs">0</span>
                                                    <small class="d-block">Glucides</small>
                                                </div>
                                                <div class="col-3">
                                                    <span class="badge bg-info fs-6" id="productFats">0</span>
                                                    <small class="d-block">Lipides</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="card-footer">
                                    <div class="input-group">
                                        <span class="input-group-text">Quantité (g)</span>
                                        <input type="number" id="productQuantity" class="form-control" value="100" min="1">
                                        <button class="btn btn-success" onclick="addScannedProduct()">
                                            <i class="fas fa-plus"></i> Ajouter au journal
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Loading -->
                        <div id="scannerLoading" class="text-center d-none">
                            <div class="spinner-border text-primary" role="status"></div>
                            <p class="mt-2">Recherche du produit...</p>
                        </div>
                        
                        <!-- Error -->
                        <div id="scannerError" class="alert alert-warning d-none">
                            <i class="fas fa-exclamation-triangle"></i>
                            <span id="scannerErrorMsg"></span>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal
    const existing = document.getElementById('barcodeScannerModal');
    if (existing) existing.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modal = new bootstrap.Modal(document.getElementById('barcodeScannerModal'));
    modal.show();
    
    // Start camera when modal opens
    document.getElementById('barcodeScannerModal').addEventListener('shown.bs.modal', startCamera);
    document.getElementById('barcodeScannerModal').addEventListener('hidden.bs.modal', stopCamera);
}

// Start camera
async function startCamera() {
    try {
        const video = document.getElementById('barcodeVideo');
        barcodeStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });
        video.srcObject = barcodeStream;
        video.play();
        scannerActive = true;
        
        // Start scanning loop
        scanForBarcode();
    } catch (error) {
        console.error('Camera error:', error);
        document.getElementById('scannerError').classList.remove('d-none');
        document.getElementById('scannerErrorMsg').textContent = 
            'Impossible d\'accéder à la caméra. Utilisez la saisie manuelle.';
    }
}

// Stop camera
function stopCamera() {
    scannerActive = false;
    if (barcodeStream) {
        barcodeStream.getTracks().forEach(track => track.stop());
        barcodeStream = null;
    }
}

// Scan for barcode using BarcodeDetector API
async function scanForBarcode() {
    if (!scannerActive) return;
    
    const video = document.getElementById('barcodeVideo');
    
    // Check if BarcodeDetector is available
    if ('BarcodeDetector' in window) {
        const barcodeDetector = new BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e']
        });
        
        try {
            const barcodes = await barcodeDetector.detect(video);
            if (barcodes.length > 0) {
                const barcode = barcodes[0].rawValue;
                console.log('📷 Barcode detected:', barcode);
                stopCamera();
                searchBarcode(barcode);
                return;
            }
        } catch (error) {
            console.error('Barcode detection error:', error);
        }
    }
    
    // Continue scanning
    if (scannerActive) {
        requestAnimationFrame(scanForBarcode);
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
