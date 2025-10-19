# ⚡ PsikoHekim - Hızlı Başlangıç Rehberi

## 📦 5 Dakikada Local Kurulum

### 1. Repoyu İndirin (zaten yaptınız ✅)

### 2. Dependencies Yükleyin
```bash
npm install
```

### 3. `.env` Dosyası Oluşturun
```bash
cp .env.example .env
```

### 4. Backend'i Başlatın (Docker Compose)
```bash
# Backend projenize gidin
cd /path/to/backend

# Docker Compose ile başlatın
docker-compose up -d

# Servislerin çalıştığını kontrol edin
docker-compose ps
```

### 5. Frontend'i Başlatın
```bash
# Frontend projesine geri dönün
cd /path/to/PsikoHekimFrontend

# Development server
npm run dev
```

### 6. Tarayıcıda Açın 🎉
```
http://localhost:3031
```

---

## 🚀 Production'a Deploy (Cloudflare Pages + Tunnel)

### Özet (Detaylar için: `CLOUDFLARE_TUNNEL_GUIDE.md`)

#### 1. Frontend Deploy (Cloudflare Pages)
```bash
# Git commit & push
git add .
git commit -m "Ready for deployment"
git push

# Cloudflare Dashboard:
# Workers & Pages > Create > Connect Git
# Repo seç > Deploy
```

#### 2. Cloudflare Tunnel Kur
```bash
# Cloudflared yükle
brew install cloudflared  # macOS

# Login
cloudflared tunnel login

# Tunnel oluştur
cloudflared tunnel create psikohekim-backend

# Config dosyası (~/.cloudflared/config.yml)
nano ~/.cloudflared/config.yml
```

**Config içeriği:**
```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /Users/username/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: bff.your-domain.com
    service: http://localhost:8083
  - service: http_status:404
```

#### 3. DNS Ayarı
```bash
cloudflared tunnel route dns psikohekim-backend bff.your-domain.com
```

#### 4. Tunnel Başlat
```bash
cloudflared tunnel run psikohekim-backend
```

#### 5. Cloudflare Pages Environment Variables
```
Cloudflare Dashboard > Your Project > Settings > Environment Variables

VITE_PSIKOHEKIM_BASE_URL = https://bff.your-domain.com
VITE_KEYCLOAK_BASE_URL = https://bff.your-domain.com
VITE_PATIENT_LIST_URL = https://bff.your-domain.com/patient/all
... (.env.production.example dosyasındaki tüm değişkenler)
```

#### 6. Redeploy Frontend
```
Cloudflare Dashboard > Deployments > Retry deployment
```

### ✅ Tamamlandı!
- Frontend: https://your-project.pages.dev
- Backend: https://bff.your-domain.com

**Maliyet: $0** 🎉

---

## 📚 Detaylı Rehberler

| Dosya | İçerik |
|-------|--------|
| `ENV_SETUP_README.md` | Environment variables detayları |
| `CLOUDFLARE_TUNNEL_GUIDE.md` | Cloudflare Tunnel kurulum (ÖNERİLEN) |
| `DEPLOYMENT_GUIDE.md` | Cloud platform deployment (Railway, Render, vb.) |
| `.env.example` | Local development env template |
| `.env.production.example` | Production env template |

---

## 🆘 Sorun mu Yaşıyorsunuz?

### Backend Bağlantı Hatası
```bash
# Backend çalışıyor mu kontrol edin
docker-compose ps

# Logları inceleyin
docker-compose logs bff
```

### Environment Variables Yüklenmiyor
```bash
# .env dosyası var mı?
ls -la .env

# Development server'ı restart edin
npm run dev
```

### CORS Hatası
- Backend CORS ayarlarını kontrol edin
- Frontend URL'ini allowed origins'a ekleyin

---

## 🎯 Sonraki Adımlar

1. ✅ Local'de test edin
2. ✅ Backend'i Docker Compose ile çalıştırın
3. ✅ Frontend'i Cloudflare Pages'e deploy edin
4. ✅ Cloudflare Tunnel ile BFF'yi expose edin
5. ✅ Production'da test edin

**Toplam süre:** ~30 dakika
**Maliyet:** $0

---

## 💡 İpuçları

- Local'de `.env` kullanın (git'e commit etmeyin)
- Production'da Cloudflare dashboard'dan environment variables yönetin
- Backend değişiklikleri: `docker-compose up -d --build`
- Frontend değişiklikleri: Otomatik deploy (git push ile)

---

**Başarılar! 🚀**

