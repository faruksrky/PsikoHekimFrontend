# 🚨 Cloudflare Pages - Kritik Kontrol Listesi

## ⚠️ URL Hala Timeout Veriyor

### 📍 ADIM 1: Build Settings Kontrolü (ÇOK ÖNEMLİ!)

**Cloudflare Dashboard → Settings → Builds & deployments:**

#### ✅ Kontrol Edin:

1. **Build command:** 
   - **OLMALI:** `npm run build`
   - **OLMAMALI:** `yarn build` veya boş

2. **Build output directory:** 
   - **OLMALI:** `dist`
   - **OLMAMALI:** `build`, `out`, `.next` veya boş

3. **Root directory:**
   - **OLMALI:** `/` veya boş
   - **OLMAMALI:** başka bir path

4. **Node version:**
   - **OLMALI:** `20` veya `20.x`

**EĞER BU AYARLAR YANLIŞSA:**
- Düzeltin
- **Save** butonuna tıklayın
- **Create deployment** ile yeni deployment başlatın

---

### 📍 ADIM 2: Build Loglarını Kontrol Edin

**Deployments → En son deployment → Details → Build Logs:**

#### 🔍 Şunları arayın:

1. **Build başarılı mı?**
   - `Build completed successfully` yazıyor mu?
   - Veya `Error:` yazıyor mu?

2. **dist klasörü oluşturulmuş mu?**
   - Build loglarında `dist` kelimesi geçiyor mu?
   - `dist/index.html` dosyası oluşturulmuş mu?

3. **_redirects dosyası var mı?**
   - Build loglarında `_redirects` kelimesi geçiyor mu?
   - `dist/_redirects` dosyası oluşturulmuş mu?

4. **Dosyalar deploy edilmiş mi?**
   - Build loglarında `Deploying files...` veya `Uploading...` yazıyor mu?

#### ❌ Yaygın Hatalar:

- `Build output directory 'dist' does not exist` → Build başarısız olmuş
- `No files found in output directory` → Build output directory yanlış
- `npm: command not found` → Node.js yüklü değil veya build command yanlış

---

### 📍 ADIM 3: Environment Variables Kontrolü

**Settings → Environment variables → Preview deployments:**

#### 🔴 MUTLAKA OLMALI:

```
VITE_KEYCLOAK_BASE_URL=https://keycloak.iyihislerapp.com
VITE_PSIKOHEKIM_BASE_URL=https://bff.iyihislerapp.com
VITE_BPMN_BASE_URL=https://bpmn.iyihislerapp.com
```

**Eğer yoksa ekleyin!**

---

### 📍 ADIM 4: Manuel Retry

1. **Deployments** sekmesine gidin
2. En son deployment'ın yanındaki **"..."** menüsüne tıklayın
3. **"Retry deployment"** seçin
4. Yeni deployment'ın tamamlanmasını bekleyin (2-3 dakika)

---

## 🆘 Bana Gönderin:

1. **Build command** nedir? (Settings → Builds & deployments)
2. **Build output directory** nedir? (Settings → Builds & deployments)
3. **Build loglarının son kısmı** (Deployment → Details → Build Logs)
   - Özellikle hata mesajları varsa
   - Build başarılı mı değil mi?
   - `dist` klasörü oluşturulmuş mu?

Bu bilgilerle sorunu kesin olarak çözebiliriz!
