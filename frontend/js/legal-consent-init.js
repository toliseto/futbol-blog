document.addEventListener('DOMContentLoaded', () => {
    // 1. Storage ve Ayarlar başlatılır
    // Zaten window üzerinde LEGAL_CONFIG ve LegalStorage yüklü olmalı

    // 2. Önce Cookie Consent başlatılır (Banner ve Tercihleri Yönetmek için Modal)
    if (window.CookieConsent) {
        window.CookieConsent.init();
    }

    // 3. Sonra KVKK Modalı kontrol edilip açılır (Eğer gerekiyorsa)
    // Eğer ikisi aynı anda gerekiyorsa, KVKK modalı üste açılır, odak orada olur.
    if (window.KvkkModal) {
        window.KvkkModal.init();
    }

    // 4. Footer Linklerini dinleme (Sadece navigasyon veya modal tetiklemeleri için)
    const cookieSettingsLink = document.getElementById('link-cookie-settings');
    if (cookieSettingsLink) {
        cookieSettingsLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.CookieConsent) {
                window.CookieConsent.openModal();
            }
        });
    }

    const kvkkPolicyLink = document.getElementById('link-kvkk-policy');
    if (kvkkPolicyLink) {
        kvkkPolicyLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.dispatchEvent(new CustomEvent('navigate-to-view', { detail: { view: 'kvkk-policy' } }));
        });
    }

    const privacyPolicyLink = document.getElementById('link-privacy-policy');
    if (privacyPolicyLink) {
        privacyPolicyLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.dispatchEvent(new CustomEvent('navigate-to-view', { detail: { view: 'privacy-policy' } }));
        });
    }

    const cookiePolicyLink = document.getElementById('link-cookie-policy');
    if (cookiePolicyLink) {
        cookiePolicyLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.dispatchEvent(new CustomEvent('navigate-to-view', { detail: { view: 'cookie-policy' } }));
        });
    }
});
