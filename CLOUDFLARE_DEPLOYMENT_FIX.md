# 🔧 Cloudflare Pages Deployment Düzeltme Rehberi

## ⚠️ Sorun: URL Timeout (Deployment Çalışmıyor)

### 📍 ADIM 1: Cloudflare Dashboard'da Kontrol Edin

1. **Cloudflare Dashboard'a gidin:**
   - https://dash.cloudflare.com
   - **Workers & Pages** → **psikohekimfrontend** projesine tıklayın

2. **Deployments sekmesine gidin:**
   - Sol menüden **Deployments** seçin
   - En son deployment'ı kontrol edin:
     - ✅ **Success** ise → Adım 2'ye geçin
     - ❌ **Failed** ise → **Details** → **Build Logs** tıklayın ve hataları okuyun
     - 🔄 **Building** ise → 2-3 dakika bekleyin

3. **Eğer deployment YOKSA veya BAŞARISIZ ise:**

---

### 📍 ADIM 2: Build Settings Kontrolü

**Settings → Builds & deployments** sekmesinde:

1. **Build command:** `npm run build` olmalı
2. **Build output directory:** `dist` olmalı
3. **Root directory:** `/` (veya boş)
4. **Node version:** `20` olmalı

**ÖNEMLİ:** Bu ayarlar doğru değilse, düzeltin ve **Save** butonuna tıklayın.

---

### 📍 ADIM 3: Environment Variables Kontrolü

**Settings → Environment variables → Preview deployments** sekmesinde:

**MUTLAKA OLMALI:**
```
VITE_KEYCLOAK_BASE_URL=https://keycloak.iyihislerapp.com
VITE_PSIKOHEKIM_BASE_URL=https://bff.iyihislerapp.com
VITE_BPMN_BASE_URL=https://bpmn.iyihislerapp.com
```

**EĞER YOKSA:**
1. **Add variable** butonuna tıklayın
2. Her birini ekleyin:
   - **Name:** `VITE_KEYCLOAK_BASE_URL`
   - **Value:** `https://keycloak.iyihislerapp.com`
   - **Environment:** Preview deployments (veya All environments)
3. **Save** butonuna tıklayın
4. Diğerlerini de ekleyin

---

### 📍 ADIM 4: Manuel Retry / Redeploy

1. **Deployments** sekmesine dönün
2. En son commit için **"Retry deployment"** butonuna tıklayın
   - VEYA
3. **Settings → Builds & deployments** → **Create deployment** → **Deploy** butonuna tıklayın

---

### 📍 ADIM 5: Build Loglarını Kontrol Edin

**Deployment → Details → Build Logs** kısmında:

**Yaygın hatalar ve çözümleri:**

#### ❌ `npm: command not found`
**Çözüm:** Build command'i `yarn build` yapın veya Node.js version'ı kontrol edin

#### ❌ `Cannot find module 'xxx'`
**Çözüm:** Build command'i şöyle yapın: `npm install && npm run build`

#### ❌ `Build output directory 'dist' does not exist`
**Çözüm:** Build başarısız olmuş, build loglarına bakın

#### ❌ `Environment variable VITE_* is undefined`
**Çözüm:** Environment variables ekleyin (Adım 3)

---

### 📍 ADIM 6: Test Edin

2-3 dakika bekledikten sonra:

```bash
# Preview URL'yi test edin
curl -I https://ba9bce59.psikohekimfrontend.pages.dev/

# VEYA tarayıcıda açın
https://ba9bce59.psikohekimfrontend.pages.dev/
```

---

## 🆘 Hala Çalışmıyorsa

**Cloudflare Dashboard'daki build loglarını bana gönderin**, birlikte çözelim!

**Özellikle şunları kontrol edin:**
1. Build loglarında **hata mesajı** var mı?
2. Build **hangi aşamada** başarısız oluyor?
3. **Environment variables** ekli mi?
4. **Build settings** doğru mu?
