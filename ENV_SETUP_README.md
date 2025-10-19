# 🔧 Environment Variables Kurulum Rehberi

Bu rehber, `.env` dosyalarınızı nasıl oluşturacağınızı ve yapılandıracağınızı gösterir.

---

## 📦 Hızlı Kurulum (Local Development)

### 1. `.env` Dosyası Oluşturma

Terminal'de aşağıdaki komutu çalıştırın:

```bash
cp .env.example .env
```

Bu komut `.env.example` dosyasını `.env` olarak kopyalar.

### 2. Kontrol

`.env` dosyasının oluşturulduğunu kontrol edin:

```bash
ls -la | grep .env
```

### 3. Development Server Başlatma

```bash
npm run dev
```

Artık local development ortamınız çalışıyor olmalı! 🎉

---

## 🚀 Production Deployment

### İki Seçeneğiniz Var:

#### 🎯 Seçenek A: Cloudflare Tunnel (ÖNERİLEN - TAMAMEN ÜCRETSİZ)

Backend'inizi kendi bilgisayarınızda Docker Compose ile çalıştırıp sadece BFF'yi Cloudflare Tunnel ile dışarıya açın.

**Avantajları:**
- ✅ Tamamen ücretsiz
- ✅ Keycloak, Camunda, Postgres güvende (local network)
- ✅ Kolay kurulum (15-20 dakika)
- ✅ Cloudflare'in global CDN'i

**Detaylı rehber:** `CLOUDFLARE_TUNNEL_GUIDE.md`

---

#### 💰 Seçenek B: Cloud Platform (ÜCRETLİ)

Backend'i bulut platformunda host edin:
- Railway ($5-20/ay)
- Render ($7+/ay)
- DigitalOcean ($12+/ay)

**Detaylı rehber:** `DEPLOYMENT_GUIDE.md`

---

## 📋 Environment Variables Açıklamaları

### Backend URLs

| Variable | Açıklama | Local | Production |
|----------|----------|-------|------------|
| `VITE_PSIKOHEKIM_BASE_URL` | Ana backend API | `http://localhost:8083` | `https://your-backend.com` |
| `VITE_KEYCLOAK_BASE_URL` | Keycloak auth server | `http://localhost:6700` | `https://your-keycloak.com` |
| `VITE_BPMN_BASE_URL` | BPMN process engine | `http://localhost:8082` | `https://your-bpmn.com` |

### Keycloak Endpoints

| Variable | Açıklama |
|----------|----------|
| `VITE_KEYCLOAK_GET_TOKEN_URL` | Token alma endpoint |
| `VITE_KEYCLOAK_GET_USER_INFO_URL` | Kullanıcı bilgisi endpoint |
| `VITE_KEYCLOAK_USERS_URL` | Kullanıcı listesi endpoint |

### Patient Endpoints

| Variable | Açıklama |
|----------|----------|
| `VITE_PATIENT_LIST_URL` | Tüm danışanları listele |
| `VITE_PATIENT_DETAILS_URL` | Danışan detayları |
| `VITE_PATIENT_SEARCH_URL` | Danışan arama |
| `VITE_PATIENT_ADD_URL` | Yeni danışan ekleme |

### Therapist Endpoints

| Variable | Açıklama |
|----------|----------|
| `VITE_THERAPIST_LIST_URL` | Tüm terapistleri listele |
| `VITE_THERAPIST_DETAILS_URL` | Terapist detayları |
| `VITE_THERAPIST_SEARCH_URL` | Terapist arama |
| `VITE_THERAPIST_ADD_URL` | Yeni terapist ekleme |

---

## 🔐 Güvenlik Uyarıları

### ⚠️ YAPILMAMASI GEREKENLER

- ❌ `.env` dosyasını Git'e commit etmeyin
- ❌ Production credentials'ları local'de kullanmayın
- ❌ API keys veya secrets'ları kod içine yazmayın
- ❌ `.env` dosyasını public repository'de paylaşmayın

### ✅ YAPILMASI GEREKENLER

- ✅ `.env` dosyası `.gitignore` içinde olmalı (varsayılan olarak zaten var)
- ✅ Production environment variables'ları sadece Cloudflare Pages'te tanımlayın
- ✅ Local ve production için farklı credentials kullanın
- ✅ `.env.example` dosyasını referans olarak kullanın

---

## 🧪 Test Etme

### Local'de Test

```bash
# Development server
npm run dev

# Production build test (local)
npm run build
npm run preview
```

### Environment Variables Kontrolü

`.env` dosyasının yüklendiğini kontrol etmek için:

```javascript
// Browser console'da
console.log(import.meta.env.VITE_PSIKOHEKIM_BASE_URL)
```

Eğer `undefined` dönerse:
1. `.env` dosyası root directory'de mi kontrol edin
2. Variable isimleri `VITE_` ile başlıyor mu kontrol edin
3. Development server'ı restart edin

---

## 🆘 Sorun Giderme

### Problem: `.env` dosyası bulunamıyor

**Çözüm:**
```bash
# Template'den kopyalayın
cp .env.example .env

# Dosyanın oluştuğunu kontrol edin
cat .env
```

---

### Problem: Environment variables yüklenmiyor

**Çözüm:**
1. Variable isimleri `VITE_` prefix'i ile başlamalı
2. Dev server'ı restart edin (Ctrl+C, sonra npm run dev)
3. `.env` dosyası root directory'de olmalı (package.json ile aynı seviyede)

---

### Problem: Backend'e bağlanamıyor (CORS hatası)

**Çözüm:**
1. Backend'in çalıştığını kontrol edin
2. Backend CORS ayarlarını kontrol edin
3. URL'lerin doğru olduğunu kontrol edin (http:// veya https://)

---

## 📚 Ek Kaynaklar

- **Deployment Guide:** `DEPLOYMENT_GUIDE.md`
- **Vite Env Docs:** https://vitejs.dev/guide/env-and-mode.html
- **Cloudflare Pages Docs:** https://developers.cloudflare.com/pages/

---

## 📞 İletişim

Sorun yaşarsanız:
1. `DEPLOYMENT_GUIDE.md` dosyasını okuyun
2. Browser console ve Network tab'ı kontrol edin
3. Backend logs'larını inceleyin

---

**Not:** Bu dosyalar sadece development için referanstır. Production environment variables'ları doğrudan Cloudflare Pages dashboard'undan yönetin.

