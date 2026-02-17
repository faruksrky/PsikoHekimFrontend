# Cloudflare + iyihislerapp.com Kurulum Rehberi

## Mevcut Durum
- ✅ **auth.iyihislerapp.com** → Keycloak (VPS 8080)
- ✅ **api.iyihislerapp.com** → Backend (VPS 8083)
- ✅ **bpmn.iyihislerapp.com** → BPMN (VPS 8082)
- ⏳ **iyihislerapp.com** → Frontend (Cloudflare Pages)

---

## Adım 1: Cloudflare DNS Ayarları

Cloudflare Dashboard → **iyihislerapp.com** (veya domain'in bağlı olduğu zone) → **DNS** → **Records**

| Type | Name | Content | Proxy | Açıklama |
|------|------|---------|-------|----------|
| A | auth | 187.77.77.215 | Proxied (turuncu) | Keycloak |
| A | api | 187.77.77.215 | Proxied (turuncu) | Backend |
| A | bpmn | 187.77.77.215 | DNS only (gri) | BPMN (SSL sunucuda) |
| CNAME | @ | psikohekimfrontend.pages.dev | Proxied | Ana domain → Pages |
| CNAME | www | psikohekimfrontend.pages.dev | Proxied | www → Pages |

**Not:** bpmn için DNS only kullandık (önceki SSL sorunları nedeniyle). api ve auth Proxied olabilir.

---

## Adım 2: Cloudflare Pages - Frontend Deploy

### 2a. GitHub Bağlantısı
1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages**
2. **Create** → **Pages** → **Connect to Git**
3. **PsikoHekimFrontend** reposunu seç (veya doğru repo)
4. **Begin setup**

### 2b. Build Ayarları
| Ayar | Değer |
|------|-------|
| Production branch | main |
| Build command | `yarn build` veya `npm run build` |
| Build output directory | `dist` |
| Root directory | (boş - proje kökünde) |

### 2c. Environment Variables (Production)
**Settings** → **Environment variables** → **Production** → **Add variable**

Cloudflare Pages, `wrangler.toml`'daki `[vars]`'ı otomatik okumaz. **Manuel ekle** - aşağıdakileri tek tek ekle:

```
NODE_VERSION = 20
VITE_PSIKOHEKIM_BASE_URL = https://api.iyihislerapp.com
VITE_KEYCLOAK_BASE_URL = https://auth.iyihislerapp.com
VITE_BPMN_BASE_URL = https://bpmn.iyihislerapp.com
VITE_KEYCLOAK_GET_TOKEN_URL = https://auth.iyihislerapp.com/keycloak/getToken
VITE_KEYCLOAK_GET_USER_INFO_URL = https://auth.iyihislerapp.com/keycloak/userInfo
VITE_KEYCLOAK_USERS_URL = https://auth.iyihislerapp.com/users
VITE_PATIENT_LIST_URL = https://api.iyihislerapp.com/patient/all
VITE_PATIENT_DETAILS_URL = https://api.iyihislerapp.com/patient/details
VITE_PATIENT_SEARCH_URL = https://api.iyihislerapp.com/patient/search
VITE_PATIENT_ADD_URL = /patient/addPatient
VITE_THERAPIST_LIST_URL = https://api.iyihislerapp.com/therapist/all
VITE_THERAPIST_DETAILS_URL = https://api.iyihislerapp.com/therapist/details
VITE_THERAPIST_SEARCH_URL = https://api.iyihislerapp.com/therapist/search
VITE_THERAPIST_ADD_URL = https://api.iyihislerapp.com/therapist/addTherapist
VITE_THERAPIST_PATIENT_PATIENTS_URL = https://api.iyihislerapp.com/therapist-patient
```

**Önemli:** Vite build sırasında bu değişkenler kullanılır. Cloudflare Pages'te **Build** sekmesinde env vars eklenmeli.

### 2d. Custom Domain
1. Pages projesi → **Custom domains**
2. **Set up a custom domain**
3. `iyihislerapp.com` ekle
4. `www.iyihislerapp.com` ekle (opsiyonel)
5. Cloudflare otomatik DNS kaydı oluşturur (CNAME @ → pages.dev)

---

## Adım 3: Keycloak Redirect URI Güncellemesi

Frontend yayına alındıktan sonra Keycloak'ta client ayarları:

1. **Keycloak Admin** → https://auth.iyihislerapp.com/admin
2. **psikohekim** realm → **Clients** → ilgili client (örn. psikohekim-frontend)
3. **Valid Redirect URIs** ekle:
   - `https://iyihislerapp.com/*`
   - `https://www.iyihislerapp.com/*`
   - `https://psikohekimfrontend.pages.dev/*` (Cloudflare preview)
4. **Web Origins** ekle: `https://iyihislerapp.com`

---

## Adım 4: Backend CORS

Backend'de `WebConfig.java` zaten `https://*.iyihislerapp.com` içeriyor. `iyihislerapp.com` (www olmadan) için de eklenmeli mi kontrol et.

---

## Adım 5: SSL/TLS (Cloudflare)

**SSL/TLS** → **Overview**
- **Flexible** veya **Full**: auth, api için Flexible yeterli (origin HTTP)
- bpmn: DNS only olduğu için sunucuda Let's Encrypt var

**Edge Certificates**
- **Always Use HTTPS**: ON
- **Minimum TLS Version**: 1.2

---

## Hızlı Kontrol Listesi

- [ ] DNS: auth, api, bpmn → VPS IP
- [ ] DNS: iyihislerapp.com → Cloudflare Pages (CNAME)
- [ ] Cloudflare Pages: Repo bağlı, build başarılı
- [ ] Cloudflare Pages: Custom domain iyihislerapp.com
- [ ] Cloudflare Pages: Env vars (VITE_*) Production'da
- [ ] Keycloak: Valid Redirect URIs güncel
- [ ] Test: https://iyihislerapp.com açılıyor mu?

---

## Sorun Giderme

**Build hatası:** `yarn build` lokal çalışıyor mu? `NODE_VERSION=20` kullan.

**Beyaz sayfa / 404:** `public/_redirects` dosyası zaten var (`/* /index.html 200`). Build sonrası `dist/` içinde olmalı.

**CORS hatası:** Backend WebConfig'te `iyihislerapp.com` (www'suz) allowed origins'da mı?

**Keycloak redirect:** Valid Redirect URIs'de `https://iyihislerapp.com` var mı?
