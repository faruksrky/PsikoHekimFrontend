# 🔍 Cloudflare Pages Deployment Kontrol Listesi

## ⚠️ Sorun: URL Timeout (Deployment çalışmıyor)

### 1. Cloudflare Dashboard → Deployments Kontrolü

**Adımlar:**
1. https://dash.cloudflare.com → Workers & Pages
2. `psikohekimfrontend` projesine tıklayın
3. **Deployments** sekmesine gidin
4. En son deployment'ı kontrol edin:
   - ✅ **Success** ise: URL çalışmalı, başka bir sorun var
   - ❌ **Failed** ise: Build loglarına bakın (aşağıdaki adımları takip edin)
   - 🔄 **Building** ise: Biraz bekleyin (2-3 dakika)

---

### 2. Build Settings Kontrolü (BAŞARISIZ İSE)

**Settings → Builds & deployments** sekmesinde şunlar olmalı:

#### ✅ Build Command:
```
npm run build
```
**VEYA** (eğer yarn kullanıyorsanız):
```
yarn build
```

#### ✅ Build Output Directory:
```
dist
```
**ÖNEMLİ:** Vite projeleri `dist` klasörüne build eder!

#### ✅ Root Directory:
```
/
```
**VEYA** boş bırakın

#### ✅ Node Version:
```
20
```
**VEYA** `20.x` (package.json'da `"engines": {"node": "20.x"}` var)

---

### 3. Environment Variables Kontrolü

**Settings → Environment variables → Preview deployments** için:

#### 🔴 MUTLAKA OLMALI:

```
VITE_KEYCLOAK_BASE_URL=https://keycloak.iyihislerapp.com
VITE_PSIKOHEKIM_BASE_URL=https://bff.iyihislerapp.com
VITE_BPMN_BASE_URL=https://bpmn.iyihislerapp.com
```

#### 🟡 ÖNERİLEN (Endpoint'ler için):

```
VITE_KEYCLOAK_GET_TOKEN_URL=https://keycloak.iyihislerapp.com/keycloak/getToken
VITE_KEYCLOAK_GET_USER_INFO_URL=https://keycloak.iyihislerapp.com/keycloak/userInfo
VITE_KEYCLOAK_USERS_URL=https://keycloak.iyihislerapp.com/users
VITE_PATIENT_LIST_URL=https://bff.iyihislerapp.com/patient/all
VITE_PATIENT_DETAILS_URL=https://bff.iyihislerapp.com/patient/details
VITE_PATIENT_SEARCH_URL=https://bff.iyihislerapp.com/patient/search
VITE_PATIENT_ADD_URL=/patient/addPatient
VITE_THERAPIST_LIST_URL=https://bff.iyihislerapp.com/therapist/all
VITE_THERAPIST_DETAILS_URL=https://bff.iyihislerapp.com/therapist/details
VITE_THERAPIST_SEARCH_URL=https://bff.iyihislerapp.com/therapist/search
VITE_THERAPIST_ADD_URL=https://bff.iyihislerapp.com/therapist/addTherapist
VITE_THERAPIST_PATIENT_PATIENTS_URL=https://bff.iyihislerapp.com/therapist-patient
```

**⚠️ ÖNEMLİ:** `tunnel-urls.txt` dosyasındaki URL'ler ESKİ (`trycloudflare.com`). Yukarıdaki URL'ler yeni tunnel URL'leri (`iyihislerapp.com`).

---

### 4. Build Loglarını Kontrol Etme

**Deployment → Details → Build Logs:**

Yaygın hatalar:

#### ❌ `npm: command not found`
**Çözüm:** Build command'i `yarn build` yapın veya Node.js kurulumunu kontrol edin

#### ❌ `Cannot find module 'xxx'`
**Çözüm:** Dependencies eksik, `npm install` başarısız olmuş

#### ❌ `Build output directory 'dist' does not exist`
**Çözüm:** Build başarısız olmuş, build loglarına bakın

#### ❌ `Environment variable VITE_* is undefined`
**Çözüm:** Environment variables ayarlanmamış (3. adımı kontrol edin)

---

### 5. Manuel Retry

1. **Deployments** sekmesinde
2. Başarısız deployment'ın yanındaki **"..."** menüsüne tıklayın
3. **"Retry deployment"** seçin

---

### 6. Production Deployment Kontrolü

**Preview deployment** yerine **Production** deployment'ı kontrol edin:

- **Settings → Builds & deployments → Production branch:** `main` olmalı
- **Production deployment** ayrı bir build yapar, environment variables da farklı olabilir

---

## 📞 Hala Çalışmıyorsa

Cloudflare Dashboard'daki build loglarını bana gönderin, birlikte çözelim!
