// Güvenli LocalStorage sarmalayıcısı
const LegalStorage = {
    kvkkKey: 'kvkkPreferences',
    cookieKey: 'cookiePreferences',

    // LocalStorage kullanılabilirliğini kontrol et
    isStorageAvailable: function() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    },

    // Veri okuma
    get: function(key) {
        if (!this.isStorageAvailable()) return null;
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('LocalStorage parse error for key:', key, error);
            return null;
        }
    },

    // Veri yazma
    set: function(key, value) {
        if (!this.isStorageAvailable()) {
            console.warn('LocalStorage is not available. Preferences will not be saved across sessions.');
            return false;
        }
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('LocalStorage write error for key:', key, error);
            return false;
        }
    },

    // KVKK Tercihlerini Getir
    getKvkkPreferences: function() {
        return this.get(this.kvkkKey);
    },

    // KVKK Onayını Kaydet
    acknowledgeKvkk: function() {
        const data = {
            version: window.LEGAL_CONFIG.kvkkVersion,
            acknowledgedAt: new Date().toISOString()
        };
        this.set(this.kvkkKey, data);
        return data;
    },

    // Çerez Tercihlerini Getir
    getCookiePreferences: function() {
        return this.get(this.cookieKey);
    },

    // Çerez Tercihlerini Kaydet
    saveCookiePreferences: function(preferences) {
        // Her zaman 'necessary' (zorunlu) çerezlerin kabul edildiğinden emin ol
        const sanitizedPreferences = {
            ...preferences,
            necessary: true
        };

        const data = {
            version: window.LEGAL_CONFIG.cookieVersion,
            updatedAt: new Date().toISOString(),
            preferences: sanitizedPreferences
        };
        this.set(this.cookieKey, data);
        return data;
    },

    // Yasal Tercihleri Sıfırla (Geliştirme / Test İçin)
    resetLegalPreferences: function() {
        if (this.isStorageAvailable()) {
            localStorage.removeItem(this.kvkkKey);
            localStorage.removeItem(this.cookieKey);
            console.log('Tüm KVKK ve Çerez tercihleri sıfırlandı. Sayfa yenileniyor...');
            window.location.reload();
        }
    }
};

window.LegalStorage = LegalStorage;

// Konsoldan test edebilmek için global fonksiyon
window.resetLegalPreferences = function() {
    LegalStorage.resetLegalPreferences();
};
