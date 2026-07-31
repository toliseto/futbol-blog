const KvkkModal = {
    modalId: 'kvkk-consent-modal',

    shouldShowModal: function() {
        const preferences = window.LegalStorage.getKvkkPreferences();
        if (!preferences) return true;
        // Eğer kayıtlı sürüm, güncel sürümden farklıysa tekrar göster
        if (preferences.version !== window.LEGAL_CONFIG.kvkkVersion) return true;
        return false;
    },

    createModalHTML: function() {
        return `
            <div class="legal-modal-overlay" id="${this.modalId}-overlay">
                <div class="legal-modal" id="${this.modalId}" role="dialog" aria-modal="true" aria-labelledby="kvkk-modal-title">
                    <h2 id="kvkk-modal-title" class="legal-modal-title">KVKK Aydınlatma Metni</h2>
                    <div class="legal-modal-meta">
                        <span>Sürüm: ${window.LEGAL_CONFIG.kvkkVersion}</span>
                        <span>Son Güncelleme: ${window.LEGAL_CONFIG.kvkkUpdatedAt}</span>
                    </div>
                    
                    <div class="legal-modal-content-scrollable">
                        <p><strong>[VERİ SORUMLUSU ADI]</strong> olarak kişisel verilerinizin güvenliği hususuna azami hassasiyet göstermekteyiz. Bu bilinçle, ürün ve hizmetlerimizden faydalanan kişiler dahil, şirketimiz ile ilişkili tüm şahıslara ait her türlü kişisel verilerin 6698 sayılı Kişisel Verilerin Korunması Kanunu'na ("KVKK") uygun olarak işlenerek, muhafaza edilmesine büyük önem atfetmekteyiz.</p>
                        
                        <h3>1. Veri Sorumlusunun Kimliği</h3>
                        <p>KVKK uyarınca, muhatap olduğunuz [VERİ SORUMLUSU ADI] veri sorumlusu sıfatına sahiptir.</p>
                        
                        <h3>2. İşlenen Kişisel Veriler</h3>
                        <p>Sitemizi ziyaretiniz sırasında temel olarak bağlantı saati ve IP adresi gibi veriler işlenmektedir. Siteye üye olmanız durumunda belirteceğiniz kullanıcı adı ve şifre gibi bilgiler de işlenecektir.</p>
                        
                        <h3>3. Kişisel Verilerin İşlenme Amaçları</h3>
                        <p>Kişisel verileriniz; sitemizin güvenliğinin sağlanması, size hizmetlerimizin sunulabilmesi ve yasal yükümlülüklerin yerine getirilebilmesi amacıyla işlenmektedir.</p>
                        
                        <p><em>Metnin tamamını aşağıdaki "Metnin Tamamı" bağlantısından okuyabilirsiniz. (Not: Bu alanlar şirket hukuki danışmanı tarafından doldurulmalıdır.)</em></p>
                    </div>

                    <div class="legal-modal-actions">
                        <a href="#" class="legal-link" id="kvkk-full-text-link">Metnin Tamamını Oku</a>
                        
                        <label class="legal-checkbox-label">
                            <input type="checkbox" id="kvkk-read-checkbox" />
                            <span>KVKK Aydınlatma Metni'ni okudum ve kişisel verilerimin işlenmesi hakkında bilgilendirildim.</span>
                        </label>

                        <button id="kvkk-accept-btn" class="legal-btn legal-btn-primary" disabled>Okudum, Bilgilendirildim</button>
                    </div>
                </div>
            </div>
        `;
    },

    init: function() {
        if (!this.shouldShowModal()) return;

        // Modal zaten varsa ekleme
        if (document.getElementById(`${this.modalId}-overlay`)) return;

        // Modalı sayfaya ekle
        document.body.insertAdjacentHTML('beforeend', this.createModalHTML());

        const overlay = document.getElementById(`${this.modalId}-overlay`);
        const modal = document.getElementById(this.modalId);
        const checkbox = document.getElementById('kvkk-read-checkbox');
        const acceptBtn = document.getElementById('kvkk-accept-btn');
        const fullTextLink = document.getElementById('kvkk-full-text-link');

        // Arka planın kaydırılmasını engelle
        document.body.style.overflow = 'hidden';

        // Checkbox durumu değiştiğinde butonu aktifleştir/pasifleştir
        checkbox.addEventListener('change', (e) => {
            acceptBtn.disabled = !e.target.checked;
        });

        // Butona tıklandığında kaydet ve kapat
        acceptBtn.addEventListener('click', () => {
            window.LegalStorage.acknowledgeKvkk();
            this.closeModal();
        });

        // Metnin tamamını oku linkine tıklandığında ilgili sayfaya git
        fullTextLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeModal();
            // Mevcut yapıda "kvkk" view'ını aç
            const navEvent = new CustomEvent('navigate-to-view', { detail: { view: 'kvkk-policy' } });
            document.dispatchEvent(navEvent);
        });

        // Focus trap (Tab ile modal dışına çıkmayı engelle)
        this.setupFocusTrap(modal);
        
        // İlk açıldığında checkbox'a odaklan
        setTimeout(() => checkbox.focus(), 100);
    },

    closeModal: function() {
        const overlay = document.getElementById(`${this.modalId}-overlay`);
        if (overlay) {
            overlay.remove();
        }
        // Sayfa kaydırmasını geri aç
        document.body.style.overflow = '';
    },

    setupFocusTrap: function(modalElement) {
        const focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
        let focusableElements = modalElement.querySelectorAll(focusableElementsString);
        focusableElements = Array.prototype.slice.call(focusableElements);

        const firstTabStop = focusableElements[0];
        const lastTabStop = focusableElements[focusableElements.length - 1];

        modalElement.addEventListener('keydown', function(e) {
            // Sadece Tab tuşunu dinle (Escape ile kapanmasını istemiyoruz)
            if (e.key === 'Tab') {
                if (e.shiftKey) { // Shift + Tab
                    if (document.activeElement === firstTabStop) {
                        e.preventDefault();
                        lastTabStop.focus();
                    }
                } else { // Sadece Tab
                    if (document.activeElement === lastTabStop) {
                        e.preventDefault();
                        firstTabStop.focus();
                    }
                }
            }
        });
    }
};

window.KvkkModal = KvkkModal;
