# 🚀 PsikoHekim Cloudflare Pages Deployment Rehberi

Bu rehber, PsikoHekim Frontend ve Backend uygulamalarınızı production'a deploy etmeniz için adım adım talimatlar içerir.

---

## 📋 İçindekiler

1. [Backend Deployment](#1-backend-deployment)
2. [Cloudflare Pages Setup](#2-cloudflare-pages-setup)
3. [Environment Variables Yapılandırması](#3-environment-variables-yapılandırması)
4. [CORS Ayarları](#4-cors-ayarları)
5. [Test ve Sorun Giderme](#5-test-ve-sorun-giderme)

---

## 1️⃣ Backend Deployment

### Adım 1: Backend Deployment Platformu Seçimi

Backend'inizi deploy etmek için aşağıdaki platformlardan birini seçin:

#### 🟢 **Railway (ÖNERİLEN - En Kolay)**

**장점:**
- ✅ Ücretsiz plan (500 saat/ay)
- ✅ Otomatik HTTPS
- ✅ Kolay Docker desteği
- ✅ Otomatik database provision

**Adımlar:**
1. [Railway.app](https://railway.app) hesabı oluşturun
2. "New Project" > "Deploy from GitHub repo" seçin
3. Backend repository'nizi seçin
4. Railway otomatik olarak Dockerfile'ı algılayacak ve build edecek
5. Deploy tamamlandığında size bir URL verilecek (örn: `https://psikohekim-backend.railway.app`)
6. Bu URL'yi not edin! ✏️

**Environment Variables:**
- Railway dashboard'da Variables sekmesinden backend için gerekli environment variables'ları ekleyin
- Database URL, port, vs.

---

#### 🔵 **Render**

**Adımlar:**
1. [Render.com](https://render.com) hesabı oluşturun
2. "New +" > "Web Service" seçin
3. GitHub repository'nizi bağlayın
4. Docker veya Spring Boot runtime seçin
5. Environment variables ekleyin
6. "Create Web Service" ile deploy edin
7. Verilen URL'yi not edin (örn: `https://psikohekim-backend.onrender.com`)

---

#### 🟣 **DigitalOcean App Platform**

**Adımlar:**
1. [DigitalOcean](https://digitalocean.com) hesabı oluşturun
2. Apps > "Create App" seçin
3. GitHub repository'nizi seçin
4. App configure edin (Dockerfile algılanacak)
5. Environment variables ekleyin
6. Deploy edin
7. Verilen URL'yi not edin

---

### Adım 2: Her Backend Servisi için URL'leri Not Edin

Deployment sonrası aşağıdaki URL'leri not edin:

```
Backend API URL: https://your-backend-api.com
Keycloak URL:    https://your-keycloak-server.com  
BPMN URL:        https://your-bpmn-server.com
```

---

## 2️⃣ Cloudflare Pages Setup

### Adım 1: Cloudflare Pages'e Proje Ekle

1. [Cloudflare Dashboard](https://dash.cloudflare.com) > Workers & Pages
2. "Create application" > "Pages" > "Connect to Git"
3. Frontend repository'nizi seçin (PsikoHekimFrontend)
4. Build ayarlarını yapılandırın:

```
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: /
```

5. "Save and Deploy" tuşuna basın

---

### Adım 2: İlk Deploy Sonrası

Deploy tamamlandığında Cloudflare size bir URL verecek:
```
https://psikohekim-frontend.pages.dev
```

⚠️ **İLK DEPLOY BAŞARISIZ OLABİLİR** - Bu normaldir! Environment variables eklemediğimiz için.

---

## 3️⃣ Environment Variables Yapılandırması

### Adım 1: Cloudflare Pages Environment Variables Ekleme

1. Cloudflare Dashboard > Workers & Pages > Your Project
2. "Settings" > "Environment variables" sekmesine gidin
3. "Add variables" butonuna tıklayın

### Adım 2: Production Environment Variables

**Aşağıdaki değişkenleri ekleyin** (Backend URL'lerinizi kullanarak):

#### Ana API URLs:

```bash
VITE_PSIKOHEKIM_BASE_URL = https://your-backend-api.com
VITE_KEYCLOAK_BASE_URL = https://your-keycloak-server.com
VITE_BPMN_BASE_URL = https://your-bpmn-server.com
```

#### Keycloak Endpoints:

```bash
VITE_KEYCLOAK_GET_TOKEN_URL = https://your-keycloak-server.com/keycloak/getToken
VITE_KEYCLOAK_GET_USER_INFO_URL = https://your-keycloak-server.com/keycloak/userInfo
VITE_KEYCLOAK_USERS_URL = https://your-keycloak-server.com/users
```

#### Patient Endpoints:

```bash
VITE_PATIENT_LIST_URL = https://your-backend-api.com/patient/all
VITE_PATIENT_DETAILS_URL = https://your-backend-api.com/patient/details
VITE_PATIENT_SEARCH_URL = https://your-backend-api.com/patient/search
VITE_PATIENT_ADD_URL = /patient/addPatient
```

#### Therapist Endpoints:

```bash
VITE_THERAPIST_LIST_URL = https://your-backend-api.com/therapist/all
VITE_THERAPIST_DETAILS_URL = https://your-backend-api.com/therapist/details
VITE_THERAPIST_SEARCH_URL = https://your-backend-api.com/therapist/search
VITE_THERAPIST_ADD_URL = https://your-backend-api.com/therapist/addTherapist
```

#### Therapist-Patient Relationship:

```bash
VITE_THERAPIST_PATIENT_PATIENTS_URL = https://your-backend-api.com/therapist-patient
```

### Adım 3: Environment Seçimi

Environment variables eklerken:
- **Production** environment'ı seçin
- Variables ekledikten sonra "Save" butonuna basın

### Adım 4: Redeploy

Environment variables ekledikten sonra:
1. "Deployments" sekmesine gidin
2. "Retry deployment" veya "View details" > "Retry deployment" butonuna tıklayın
3. Yeni build başlayacak ve bu sefer environment variables ile build edilecek

---

## 4️⃣ CORS Ayarları

Backend'inizde CORS ayarlarını mutlaka güncelleyin! Aksi halde frontend API'lara erişemez.

### Spring Boot için CORS Ayarları:

#### Option 1: application.properties

```properties
# Cloudflare Pages URL'nizi ekleyin
allowed.origins=https://psikohekim-frontend.pages.dev,https://your-custom-domain.com
```

#### Option 2: WebConfig.java

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins(
                "https://psikohekim-frontend.pages.dev",
                "https://your-custom-domain.com"
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

#### Option 3: Security Config (Spring Security kullanıyorsanız)

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.cors().configurationSource(corsConfigurationSource());
    // ... diğer security ayarları
    return http.build();
}

@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList(
        "https://psikohekim-frontend.pages.dev",
        "https://your-custom-domain.com"
    ));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

---

## 5️⃣ Test ve Sorun Giderme

### Test Checklist

Deployment sonrası aşağıdakileri test edin:

- [ ] Frontend sayfası açılıyor mu?
- [ ] Login çalışıyor mu?
- [ ] Patient listesi görüntüleniyor mu?
- [ ] Therapist listesi görüntüleniyor mu?
- [ ] Yeni patient/therapist eklenebiliyor mu?
- [ ] Browser console'da CORS hatası yok mu?
- [ ] API çağrıları başarılı mı (Network tab'de kontrol edin)?

### Yaygın Sorunlar ve Çözümleri

#### ❌ Problem: CORS Hatası

**Hata mesajı:**
```
Access to fetch at 'https://your-backend-api.com' from origin 'https://psikohekim-frontend.pages.dev' has been blocked by CORS policy
```

**Çözüm:**
- Backend'de CORS ayarlarını kontrol edin
- Cloudflare Pages URL'nizi allowed origins'a eklediğinizden emin olun
- Backend'i redeploy edin

---

#### ❌ Problem: Environment Variables Yüklenmedi

**Belirtiler:**
- API URL'leri undefined veya localhost olarak görünüyor
- Network tab'de localhost'a istek gidiyor

**Çözüm:**
1. Cloudflare Dashboard > Settings > Environment variables kontrol edin
2. Tüm değişkenlerin Production environment'ına eklendiğinden emin olun
3. Deployment'ı retry edin (yeni build gerekli)

---

#### ❌ Problem: 404 Not Found (API)

**Çözüm:**
- Backend URL'lerinin doğru olduğundan emin olun
- Backend'in çalıştığını kontrol edin
- Endpoint path'lerinin doğru olduğunu kontrol edin

---

#### ❌ Problem: Authentication Çalışmıyor

**Çözüm:**
- Keycloak URL'nin doğru olduğundan emin olun
- Keycloak'ta client configuration'ı kontrol edin
- Valid redirect URIs'e Cloudflare URL'nizi ekleyin
- withCredentials: true ayarının aktif olduğunu kontrol edin

---

## 🎉 Deploy Başarılı!

Tüm adımları tamamladıysanız, PsikoHekim uygulamanız artık production'da çalışıyor olmalı!

### Yararlı Linkler

- **Frontend URL:** https://psikohekim-frontend.pages.dev
- **Backend URL:** https://your-backend-api.com
- **Cloudflare Dashboard:** https://dash.cloudflare.com

---

## 📝 Ek Notlar

### Custom Domain Ekleme (Opsiyonel)

Cloudflare Pages'e custom domain eklemek için:

1. Cloudflare Dashboard > Workers & Pages > Your Project
2. "Custom domains" sekmesi > "Set up a custom domain"
3. Domain adınızı girin (örn: app.psikohekim.com)
4. DNS kayıtlarını ekleyin (Cloudflare otomatik yapacak)
5. SSL/TLS sertifikası otomatik oluşturulacak

### Monitoring ve Logs

- **Cloudflare Logs:** Dashboard > Analytics > Logs
- **Backend Logs:** Deployment platformunuzun (Railway/Render) dashboard'unda
- **Browser DevTools:** Console ve Network tab'ı kullanın

---

## 🆘 Yardım

Sorun yaşarsanız:

1. Browser console'u kontrol edin (F12)
2. Network tab'de failed requests'leri inceleyin
3. Backend logs'larını kontrol edin
4. CORS ayarlarını doğrulayın
5. Environment variables'ların doğru set edildiğini kontrol edin

---

**Son güncelleme:** 2025-10-12

