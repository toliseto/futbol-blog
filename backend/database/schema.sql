-- Futbol Blog veritabanı şeması

CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(100) NOT NULL DEFAULT 'Editör',
    image_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Örnek futbol yazıları
INSERT INTO posts (title, content, author, image_url) VALUES
(
    'Şampiyonlar Ligi Çeyrek Final Heyecanı',
    'Bu sezon Şampiyonlar Ligi çeyrek finalleri, göz kamaştırıcı goller ve nefes kesen mücadelelerle geçti. Takımlar sahaya adeta ölüm kalım maçına çıkar gibi çıktı. Taktik disiplin ve bireysel yeteneğin buluştuğu karşılaşmalarda, son düdük çalana kadar sonuç belli olmadı. Yarı final eşleşmeleri şimdiden futbolseverleri heyecanlandırıyor.',
    'Ahmet Yılmaz',
    NULL
),
(
    'Genç Yeteneklerin Yükselişi',
    'Avrupa''nın büyük liglerinde bu sezon dikkat çeken isim, genç oyuncuların sahalara damga vurması oldu. 20 yaş altı futbolcular, deneyimli yıldızlarla aynı sahada boy gösterirken performanslarıyla kulüplerin geleceğine dair umut veriyor. Alt yapıdan gelen bu oyuncuların gelişimi, transfer pazarında da büyük ilgi görüyor.',
    'Elif Demir',
    NULL
),
(
    'Taktik Analiz: 4-3-3''ün Modern Yorumu',
    'Modern futbolda 4-3-3 dizilişi, kanat oyuncularının içe kaydığı ve bekin genişliği kullandığı bir yapıya evrildi. Orta sahada sayısal üstünlük kurmak isteyen takımlar, bu sistemi farklı varyasyonlarla sahaya yansıtıyor. Bu yazıda, günümüzün başarılı takımlarının 4-3-3''ü nasıl yorumladığını inceliyoruz.',
    'Mert Kaya',
    NULL
);
