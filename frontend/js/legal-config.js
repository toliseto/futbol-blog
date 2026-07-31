const LEGAL_CONFIG = {
    // Merkezi KVKK ve Çerez sürüm numaraları.
    // KVKK metni veya çerez politikası güncellendiğinde buradaki numaralar artırılmalıdır.
    kvkkVersion: "1.0.0",
    kvkkUpdatedAt: "31.07.2026", // Format: GG.AA.YYYY
    
    cookieVersion: "1.0.0",
    cookieUpdatedAt: "31.07.2026",
    
    // Çerez kategorileri (Zorunlu çerezler her zaman gereklidir ve kapatılamaz)
    cookieCategories: {
        necessary: {
            id: 'necessary',
            name: 'Zorunlu Çerezler',
            description: 'Oturum, güvenlik ve temel site işlevlerinin çalışabilmesi için gereklidir.',
            required: true
        },
        analytics: {
            id: 'analytics',
            name: 'Analitik Çerezler',
            description: 'Sitemizi nasıl kullandığınızı anlamamıza ve kullanıcı deneyimini geliştirmemize yardımcı olur.',
            required: false
        },
        marketing: {
            id: 'marketing',
            name: 'Pazarlama Çerezleri',
            description: 'Size ilgi alanlarınıza göre özelleştirilmiş reklamlar göstermek için kullanılır.',
            required: false
        },
        functional: {
            id: 'functional',
            name: 'İşlevsel Çerezler',
            description: 'Dil seçimi gibi kullanıcı tercihlerinizi hatırlamamızı ve size özel işlevler sunmamızı sağlar.',
            required: false
        }
    }
};

window.LEGAL_CONFIG = LEGAL_CONFIG;
