# TaskFlow — Kanban Proje Yönetim Tahtası

Trello benzeri, sürükle-bırak destekli kanban uygulaması. Kayıt/giriş, çoklu board, sütun ve kart yönetimi.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **@dnd-kit** — sürükle-bırak (kart + sütun)
- **Zustand** — state yönetimi, localStorage persist
- **CSS Modules** — scoped styling

## Özellikler

- **Auth** — Email + kullanıcı adı + şifre ile kayıt/giriş
  - Şifre kuralları: min 8 karakter, 1 büyük harf, 1 rakam
  - Şifre gücü göstergesi (Weak → Strong)
- **Username** — Header'da tıklanarak düzenlenebilir
- **Board kurulum ekranı** — İlk girişte board oluşturma adımı, hazır şablonlarla
- **Multi-board** — Kullanıcıya özel birden fazla board
- **Sütun CRUD** — Ekle, yeniden adlandır, sil, sürükle-bırak ile sırala
- **Kart CRUD** — Ekle, düzenle, sil, sütunlar arası sürükle-bırak
- **Etiket + son tarih** — Kart başına label ve due date
- **Mobil desteği** — Touch sensor ile

## Yerel Çalıştırma

```bash
npm install
npm run dev
# http://localhost:3000
```

## Vercel Deploy

GitHub'a push edip [vercel.com](https://vercel.com) dashboard'dan import et — Next.js otomatik algılanır.

```bash
npm install -g vercel
vercel
```

## Klasör Yapısı

```
app/          Next.js App Router sayfaları
components/   React bileşenleri + CSS Modules
lib/          Yardımcı fonksiyonlar, sabitler
store/        Zustand store (localStorage persist)
types/        TypeScript tip tanımları
```

## Mimari Notlar

**Sürükle-Bırak:** `@dnd-kit` — react-beautiful-dnd artık bakımda değil; dnd-kit TypeScript-first, tree-shakeable ve mobil uyumlu.

**Sıralama:** Her kart ve sütunun `order: number` alanı var. Sürükleme bitince Zustand store güncellenir, `persist` middleware localStorage'a yazar — sayfa yenilense de sıra korunur.

**Auth:** Gerçek backend yok, kullanıcı verileri ve şifre hash'leri localStorage'da tutulur. Zustand persist ile board/kart verisi de tarayıcıda saklanır.

**Kapsam dışı:**
- Gerçek backend / veritabanı (Supabase eklenebilir)
- Çoklu kullanıcı eş zamanlı çalışma
- Aktivite geçmişi
