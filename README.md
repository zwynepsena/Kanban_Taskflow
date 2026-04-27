# TaskFlow — Kanban Proje Yönetim Tahtası

Trello benzeri, sürükle-bırak destekli kanban uygulaması.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **@dnd-kit** — sürükle-bırak (kart + sütun)
- **Zustand** — state yönetimi, localStorage persist
- **CSS Modules** — scoped styling

## Yerel Çalıştırma

```bash
npm install
npm run dev
# http://localhost:3000
```

## Vercel Deploy

```bash
npm install -g vercel
vercel
```

Ya da GitHub'a push edip Vercel dashboard'dan import et — otomatik algılar.

## Mimari Kararları

### Sürükle-Bırak: @dnd-kit
- react-beautiful-dnd artık bakımda değil
- dnd-kit: modern, tree-shakeable, TypeScript-first
- TouchSensor ile mobil desteği kutudan çıkar
- PointerSensor activation distance: 5px — yanlışlıkla tetiklenmez

### Sıralama Persistansı
Her kart ve sütunun `order: number` alanı var.
- Sürükleme bitince Zustand store güncellenir
- Zustand `persist` middleware → localStorage'a yazar
- Sayfa yenilense de sıra korunur

### Kapsam Kararları (48h)
✅ Auth (localStorage hash)  
✅ Multi-board  
✅ Sütun CRUD + sürükleme  
✅ Kart CRUD + sürükleme (sütunlar arası)  
✅ Etiket + son tarih  
✅ Mobil touch desteği  
❌ Gerçek backend/DB (Supabase eklenebilir)  
❌ Çoklu kullanıcı aynı anda  
❌ Aktivite geçmişi  

## Klasör Yapısı

```
app/          Next.js App Router sayfaları
components/   React bileşenleri + CSS Modules
lib/          Yardımcı fonksiyonlar, sabitler
store/        Zustand store
types/        TypeScript tipleri
```
