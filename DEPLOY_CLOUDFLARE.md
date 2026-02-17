# Cloudflare Pages - psikohekimfrontend Deploy Rehberi

## Mevcut Proje
- **URL:** https://psikohekimfrontend.pages.dev
- **Repo:** faruksrky/PsikoHekimFrontend
- **Son deploy:** 16h ago

---

## 1. Environment Variables Düzeltmesi

**Cloudflare Dashboard** → **Workers & Pages** → **psikohekimfrontend** → **Settings** → **Environment variables**

### Production için kontrol et:

| Değişken | Doğru Değer | Yanlış Örnek |
|----------|-------------|--------------|
| VITE_BPMN_BASE_URL | `https://bpmn.iyihislerapp.com` | ~~bpmn.iyihislerapp.com~~ (https:// eksik!) |
| VITE_PSIKOHEKIM_BASE_URL | `https://api.iyihislerapp.com` | |
| VITE_KEYCLOAK_BASE_URL | `https://auth.iyihislerapp.com` | |
| VITE_KEYCLOAK_GET_TOKEN_URL | `https://auth.iyihislerapp.com/keycloak/getToken` | |
| VITE_KEYCLOAK_GET_USER_INFO_URL | `https://auth.iyihislerapp.com/keycloak/userInfo` | |
| VITE_KEYCLOAK_USERS_URL | `https://auth.iyihislerapp.com/users` | |
| VITE_PATIENT_LIST_URL | `https://api.iyihislerapp.com/patient/all` | |
| VITE_PATIENT_DETAILS_URL | `https://api.iyihislerapp.com/patient/details` | |
| VITE_PATIENT_SEARCH_URL | `https://api.iyihislerapp.com/patient/search` | |
| VITE_PATIENT_ADD_URL | `/patient/addPatient` | |
| VITE_THERAPIST_LIST_URL | `https://api.iyihislerapp.com/therapist/all` | |
| VITE_THERAPIST_DETAILS_URL | `https://api.iyihislerapp.com/therapist/details` | |
| VITE_THERAPIST_SEARCH_URL | `https://api.iyihislerapp.com/therapist/search` | |
| VITE_THERAPIST_ADD_URL | `https://api.iyihislerapp.com/therapist/addTherapist` | |
| VITE_THERAPIST_PATIENT_PATIENTS_URL | `https://api.iyihislerapp.com/therapist-patient` | |
| NODE_VERSION | `20` | |

**Önemli:** Tüm URL'ler `https://` ile başlamalı!

---

## 2. Yeni Deploy Tetikleme

### Yöntem A: Git Push (Otomatik)
```bash
cd ~/PsikoHekimFrontend
git add .
git commit -m "Fix env vars"
git push origin main
```
Push sonrası Cloudflare otomatik build başlatır.

### Yöntem B: Dashboard'dan Retry
- **Workers & Pages** → **psikohekimfrontend** → **Deployments**
- Son deployment'a tıkla → **Retry deployment**

### Yöntem C: Redeploy
- **Deployments** → **Create deployment** → **Retry deployment** (veya yeni commit gerekir)

---

## 3. Custom Domain Ekleme (iyihislerapp.com)

1. **Workers & Pages** → **psikohekimfrontend** → **Custom domains**
2. **Set up a custom domain**
3. `iyihislerapp.com` yaz → **Continue**
4. `www.iyihislerapp.com` ekle (opsiyonel)
5. Cloudflare otomatik DNS kaydı oluşturur (CNAME)

**Ön koşul:** iyihislerapp.com domain'i bu Cloudflare hesabında olmalı (DNS yönetimi Cloudflare'da).

---

## 4. Build Ayarları Kontrolü

**Settings** → **Builds & deployments** → **Build configuration**

| Ayar | Değer |
|------|-------|
| Production branch | `main` |
| Build command | `yarn build` veya `npm run build` |
| Build output directory | `dist` |
| Root directory | (boş) |
| Environment variables | Production'da yukarıdaki liste |

---

## 5. Hızlı Kontrol

1. **VITE_BPMN_BASE_URL** = `https://bpmn.iyihislerapp.com` (https:// ekle!)
2. Env vars değiştiyse → **Retry deployment** veya **git push**
3. https://psikohekimfrontend.pages.dev açılıyor mu test et
4. Custom domain: iyihislerapp.com ekle
