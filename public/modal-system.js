// Global Modal System
(function () {
    // Create modal container on page load
    function createModalSystem() {
        // Alert Modal HTML
        const alertModal = `
            <div id="globalAlertModal" class="global-modal">
                <div class="global-modal-content alert-modal">
                    <div class="modal-icon">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <h3 id="alertTitle">Notice</h3>
                    <p id="alertMessage"></p>
                    <div class="modal-actions">
                        <button class="btn btn-primary" onclick="window.closeAlert()">
                            <i class="fas fa-check"></i>OK
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Confirm Modal HTML
        const confirmModal = `
            <div id="globalConfirmModal" class="global-modal">
                <div class="global-modal-content confirm-modal">
                    <div class="modal-icon warning">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3 id="confirmTitle">Confirm Action</h3>
                    <p id="confirmMessage"></p>
                    <div class="modal-actions">
                        <button class="btn btn-secondary" onclick="window.cancelConfirm()">
                            <i class="fas fa-times"></i>Cancel
                        </button>
                        <button class="btn btn-danger" id="confirmButton">
                            <i class="fas fa-check"></i>Confirm
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Success Modal HTML
        const successModal = `
            <div id="globalSuccessModal" class="global-modal">
                <div class="global-modal-content success-modal">
                    <div class="modal-icon success">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3 id="successTitle">Success</h3>
                    <p id="successMessage"></p>
                    <div class="modal-actions">
                        <button class="btn btn-success" onclick="window.closeSuccess()">
                            <i class="fas fa-check"></i>OK
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Error Modal HTML
        const errorModal = `
            <div id="globalErrorModal" class="global-modal">
                <div class="global-modal-content error-modal">
                    <div class="modal-icon error">
                        <i class="fas fa-times-circle"></i>
                    </div>
                    <h3 id="errorTitle">Error</h3>
                    <p id="errorMessage"></p>
                    <div class="modal-actions">
                        <button class="btn btn-danger" onclick="window.closeError()">
                            <i class="fas fa-check"></i>OK
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add to body
        const container = document.createElement('div');
        container.innerHTML = alertModal + confirmModal + successModal + errorModal;
        document.body.appendChild(container);

        // Add styles
        addModalStyles();
    }

    function addModalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .global-modal {
                display: none;
                position: fixed;
                z-index: 10000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(4px);
                animation: fadeIn 0.2s ease;
            }

            .global-modal.show {
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .global-modal-content {
                background: var(--bg-secondary);
                padding: 40px;
                border-radius: 16px;
                max-width: 450px;
                width: 90%;
                border: 1px solid var(--border-color);
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                text-align: center;
                animation: slideUp 0.3s ease;
            }

            .modal-icon {
                font-size: 64px;
                margin-bottom: 20px;
                color: var(--accent-primary);
            }

            .modal-icon.warning {
                color: var(--warning);
            }

            .modal-icon.success {
                color: var(--success);
            }

            .modal-icon.error {
                color: var(--error);
            }

            .global-modal-content h3 {
                font-size: 24px;
                margin-bottom: 15px;
                color: var(--text-primary);
            }

            .global-modal-content p {
                font-size: 16px;
                color: var(--text-secondary);
                margin-bottom: 30px;
                line-height: 1.6;
            }

            .modal-actions {
                display: flex;
                gap: 10px;
                justify-content: center;
            }

            .modal-actions .btn {
                min-width: 120px;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes slideUp {
                from {
                    transform: translateY(30px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Global alert function
    window.showAlert = function (message, title = 'Notice') {
        const modal = document.getElementById('globalAlertModal');
        document.getElementById('alertTitle').textContent = title;
        document.getElementById('alertMessage').textContent = message;
        modal.classList.add('show');
    };

    window.closeAlert = function () {
        document.getElementById('globalAlertModal').classList.remove('show');
    };

    // Global confirm function
    let confirmCallback = null;
    window.showConfirm = function (message, callback, title = 'Confirm Action') {
        return new Promise((resolve) => {
            const modal = document.getElementById('globalConfirmModal');
            document.getElementById('confirmTitle').textContent = title;
            document.getElementById('confirmMessage').textContent = message;

            confirmCallback = (result) => {
                resolve(result);
                if (callback) callback(result);
            };

            const confirmBtn = document.getElementById('confirmButton');
            confirmBtn.onclick = () => {
                modal.classList.remove('show');
                confirmCallback(true);
            };

            modal.classList.add('show');
        });
    };

    window.cancelConfirm = function () {
        document.getElementById('globalConfirmModal').classList.remove('show');
        if (confirmCallback) confirmCallback(false);
    };

    // Global success function
    window.showSuccess = function (message, title = 'Success') {
        const modal = document.getElementById('globalSuccessModal');
        document.getElementById('successTitle').textContent = title;
        document.getElementById('successMessage').textContent = message;
        modal.classList.add('show');
    };

    window.closeSuccess = function () {
        document.getElementById('globalSuccessModal').classList.remove('show');
    };

    // Global error function
    window.showError = function (message, title = 'Error') {
        const modal = document.getElementById('globalErrorModal');
        document.getElementById('errorTitle').textContent = title;
        document.getElementById('errorMessage').textContent = message;
        modal.classList.add('show');
    };

    window.closeError = function () {
        document.getElementById('globalErrorModal').classList.remove('show');
    };

    // Override native alert and confirm
    window.alert = function (message) {
        window.showAlert(message);
    };

    const originalConfirm = window.confirm;
    window.confirm = function (message) {
        // For synchronous code, we need to handle this carefully
        // Return a promise-based version
        return window.showConfirm(message);
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createModalSystem);
    } else {
        createModalSystem();
    }

    // Close modals on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.closeAlert();
            window.cancelConfirm();
            window.closeSuccess();
            window.closeError();
        }
    });
})();
