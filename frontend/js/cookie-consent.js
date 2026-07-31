const CookieConsent = {
    bannerId: 'cookie-consent-banner',
    modalId: 'cookie-preferences-modal',

    shouldShowBanner: function() {
        const preferences = window.LegalStorage.getCookiePreferences();
        if (!preferences) return true;
        if (preferences.version !== window.LEGAL_CONFIG.cookieVersion) return true;
        return false;
    },

    createBannerHTML: function() {
        return `
            <div id="${this.bannerId}" class="cookie-banner" role="region" aria-label="Çerez Bildirimi">
                <div class="cookie-banner-content">
                    <p>Sizlere daha iyi bir deneyim sunabilmek için sitemizde çerezler kullanılmaktadır. Kişisel verileriniz, KVKK ve Gizlilik Politikamız kapsamında işlenmektedir.</p>
                </div>
                <div class="cookie-banner-actions">
                    <button id="cookie-btn-manage" class="legal-btn legal-btn-secondary">Tercihleri Yönet</button>
                    <button id="cookie-btn-necessary" class="legal-btn legal-btn-secondary">Zorunlu Olanlarla Devam Et</button>
                    <button id="cookie-btn-accept-all" class="legal-btn legal-btn-primary">Tümünü Kabul Et</button>
                </div>
            </div>
        `;
    },

    createModalHTML: function() {
        const categories = window.LEGAL_CONFIG.cookieCategories;
        let categoriesHTML = '';
        
        // Mevcut tercihleri al, yoksa varsayılan olarak hepsini false yap (zorunlu hariç)
        const currentPrefs = window.LegalStorage.getCookiePreferences()?.preferences || {};

        for (const key in categories) {
            const cat = categories[key];
            const isChecked = cat.required || currentPrefs[key] === true;
            const disabledAttr = cat.required ? 'disabled checked' : (isChecked ? 'checked' : '');
            
            categoriesHTML += `
                <div class="cookie-category">
                    <div class="cookie-category-header">
                        <div class="cookie-category-title">
                            <h4>${cat.name}</h4>
                            <label class="toggle-switch">
                                <input type="checkbox" id="cookie-toggle-${key}" data-category="${key}" ${disabledAttr}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        <p class="cookie-category-desc">${cat.description}</p>
                    </div>
                </div>
            `;
        }

        return `
            <div class="legal-modal-overlay" id="${this.modalId}-overlay" style="display: none;">
                <div class="legal-modal cookie-modal" id="${this.modalId}" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title">
                    <h2 id="cookie-modal-title" class="legal-modal-title">Çerez Tercihleri</h2>
                    <p class="legal-modal-subtitle">Gizliliğiniz bizim için önemlidir. Web sitemizi kullanırken hangi çerezlere izin vereceğinizi aşağıdan seçebilirsiniz.</p>
                    
                    <div class="cookie-categories-container">
                        ${categoriesHTML}
                    </div>

                    <div class="legal-modal-actions" style="justify-content: flex-end; margin-top: 20px;">
                        <button id="cookie-modal-save-btn" class="legal-btn legal-btn-primary">Tercihlerimi Kaydet</button>
                    </div>
                    <button class="cookie-modal-close" id="cookie-modal-close-btn" aria-label="Kapat">×</button>
                </div>
            </div>
        `;
    },

    init: function() {
        // Modal DOM'a ekleniyor (her zaman hazır bulunmalı, Preferences linkinden açılabilmesi için)
        if (!document.getElementById(`${this.modalId}-overlay`)) {
            document.body.insertAdjacentHTML('beforeend', this.createModalHTML());
            this.bindModalEvents();
        }

        // Eğer izinler verilmişse scriptleri yükle ve bitir
        if (!this.shouldShowBanner()) {
            this.loadScriptsBasedOnConsent();
            return;
        }

        // Banner DOM'a ekleniyor
        if (!document.getElementById(this.bannerId)) {
            document.body.insertAdjacentHTML('beforeend', this.createBannerHTML());
            this.bindBannerEvents();
        }
    },

    bindBannerEvents: function() {
        const banner = document.getElementById(this.bannerId);
        
        document.getElementById('cookie-btn-manage').addEventListener('click', () => {
            this.openModal();
        });

        document.getElementById('cookie-btn-necessary').addEventListener('click', () => {
            this.saveConsent({ analytics: false, marketing: false, functional: false });
            this.closeBanner();
        });

        document.getElementById('cookie-btn-accept-all').addEventListener('click', () => {
            this.saveConsent({ analytics: true, marketing: true, functional: true });
            this.closeBanner();
        });
    },

    bindModalEvents: function() {
        const saveBtn = document.getElementById('cookie-modal-save-btn');
        const closeBtn = document.getElementById('cookie-modal-close-btn');

        saveBtn.addEventListener('click', () => {
            const newPreferences = {};
            const categories = window.LEGAL_CONFIG.cookieCategories;
            
            for (const key in categories) {
                if (key !== 'necessary') {
                    const toggle = document.getElementById(`cookie-toggle-${key}`);
                    newPreferences[key] = toggle.checked;
                }
            }
            
            this.saveConsent(newPreferences);
            this.closeModal();
            this.closeBanner(); // Eğer açıksa banner'ı da kapat
        });

        closeBtn.addEventListener('click', () => {
            this.closeModal();
        });

        // Overlay'e tıklanınca kapat (Opsiyonel ama UX için iyi)
        document.getElementById(`${this.modalId}-overlay`).addEventListener('click', (e) => {
            if (e.target.id === `${this.modalId}-overlay`) {
                this.closeModal();
            }
        });
    },

    saveConsent: function(preferences) {
        window.LegalStorage.saveCookiePreferences(preferences);
        this.loadScriptsBasedOnConsent();
    },

    openModal: function() {
        // Modal açılırken güncel durumu yansıt
        const currentPrefs = window.LegalStorage.getCookiePreferences()?.preferences || {};
        const categories = window.LEGAL_CONFIG.cookieCategories;
        
        for (const key in categories) {
            if (key !== 'necessary') {
                const toggle = document.getElementById(`cookie-toggle-${key}`);
                if (toggle) {
                    toggle.checked = currentPrefs[key] === true;
                }
            }
        }

        document.getElementById(`${this.modalId}-overlay`).style.display = 'flex';
        document.body.style.overflow = 'hidden';
    },

    closeModal: function() {
        document.getElementById(`${this.modalId}-overlay`).style.display = 'none';
        document.body.style.overflow = '';
    },

    closeBanner: function() {
        const banner = document.getElementById(this.bannerId);
        if (banner) {
            banner.remove();
        }
    },

    loadScriptsBasedOnConsent: function() {
        const preferences = window.LegalStorage.getCookiePreferences()?.preferences || {};
        
        if (preferences.analytics) {
            this.loadAnalyticsScripts();
        }
        if (preferences.marketing) {
            this.loadMarketingScripts();
        }
        if (preferences.functional) {
            this.loadFunctionalScripts();
        }
    },

    // Script Yükleyici Yardımcı Fonksiyonları
    loadAnalyticsScripts: function() {
        if (window.analyticsLoaded) return; // Zaten yüklüyse tekrar yükleme
        console.log('Analytics scriptleri yükleniyor...');
        
        // Örnek: Google Analytics (Fake implementation for demo)
        /*
        const script = document.createElement("script");
        script.src = "https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX";
        script.async = true;
        document.head.appendChild(script);
        */
        
        window.analyticsLoaded = true;
    },

    loadMarketingScripts: function() {
        if (window.marketingLoaded) return;
        console.log('Marketing scriptleri yükleniyor...');
        window.marketingLoaded = true;
    },

    loadFunctionalScripts: function() {
        if (window.functionalLoaded) return;
        console.log('Functional scriptleri yükleniyor...');
        window.functionalLoaded = true;
    }
};

window.CookieConsent = CookieConsent;
