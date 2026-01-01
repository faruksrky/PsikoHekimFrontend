# 🔧 CORS Hatası Çözüm Rehberi

## 🚨 Sorun

Cloudflare Pages'ten Keycloak servisine istek gönderilirken CORS hatası alınıyor:

```
Access to XMLHttpRequest at 'https://keycloak.iyihislerapp.com/keycloak/getToken' 
from origin 'https://54e90153.psikohekimfrontend.pages.dev' 
has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 📊 Sorunun Analizi

**Frontend (İstek Gönderen):**
- URL: `https://54e90153.psikohekimfrontend.pages.dev` (Cloudflare Pages)

**Backend (İstek Alan):**
- URL: `https://keycloak.iyihislerapp.com` (Keycloak Auth Service)

**Sorun:** Keycloak servisi CORS başlıklarını göndermiyor, bu yüzden tarayıcı isteği engelliyor.

---

## ✅ Çözüm Seçenekleri

### Seçenek 1: Keycloak Servisinde CORS Ayarları (ÖNERİLEN)

Keycloak servisinizin CORS yapılandırmasını güncelleyin.

#### Spring Boot Backend İse:

`WebConfig.java` veya `SecurityConfig.java` dosyasında:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    
    // Cloudflare Pages URL'lerini ekle
    configuration.setAllowedOriginPatterns(List.of(
        "https://*.psikohekimfrontend.pages.dev",  // Cloudflare Pages pattern
        "https://psikohekimfrontend.pages.dev",    // Production domain
        "http://localhost:3031",                    // Local development
        "https://*.iyihislerapp.com"                // Diğer domainler
    ));
    
    configuration.setAllowedMethods(Arrays.asList(
        "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
    ));
    
    configuration.setAllowedHeaders(Arrays.asList(
        "*"  // Tüm header'lara izin ver
    ));
    
    configuration.setExposedHeaders(Arrays.asList(
        "Authorization", "Content-Type"
    ));
    
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);  // Preflight cache 1 saat
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

#### SecurityFilterChain'de CORS'u Aktif Et:

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .csrf(AbstractHttpConfigurer::disable)
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))  // CORS'u aktif et
        .authorizeHttpRequests(authorizeRequests ->
            authorizeRequests
                .requestMatchers("/keycloak/**").permitAll()  // Keycloak endpoint'lerini permitAll'a ekle
                // ... diğer endpoint'ler
        );
    
    return http.build();
}
```

---

### Seçenek 2: Cloudflare Workers ile Proxy (Geçici Çözüm)

Eğer Keycloak servisini hemen güncelleyemiyorsanız, Cloudflare Workers ile bir proxy oluşturabilirsiniz.

**Not:** Bu yöntem geçici bir çözümdür. Uzun vadede Seçenek 1'i uygulamanız önerilir.

#### Worker Kodu:

```javascript
// keycloak-proxy-worker.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // CORS preflight isteğini handle et
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '3600',
      },
    })
  }

  // Keycloak servisine isteği forward et
  const url = new URL(request.url)
  const keycloakUrl = `https://keycloak.iyihislerapp.com${url.pathname}${url.search}`
  
  const response = await fetch(keycloakUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  })

  // CORS header'larını ekle
  const modifiedResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...Object.fromEntries(response.headers),
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })

  return modifiedResponse
}
```

**Cloudflare Workers'a Deploy:**
1. Cloudflare Dashboard > Workers & Pages > Create Worker
2. Worker kodunu yapıştırın
3. Route ekleyin: `keycloak-proxy.your-domain.com/*`

---

### Seçenek 3: Backend'de Keycloak Endpoint'lerini Proxy Et

Mevcut backend'inizde (`PsikoHekimBackend`) Keycloak isteklerini proxy eden endpoint'ler oluşturun.

**Örnek Controller:**

```java
@RestController
@RequestMapping("/keycloak")
public class KeycloakProxyController {
    
    private final RestTemplate restTemplate;
    private final String keycloakBaseUrl = "http://keycloak:6700";  // Veya environment variable
    
    @PostMapping("/getToken")
    public ResponseEntity<?> getToken(@RequestBody Map<String, String> request) {
        String url = keycloakBaseUrl + "/keycloak/getToken";
        return restTemplate.postForEntity(url, request, Object.class);
    }
    
    @GetMapping("/userInfo")
    public ResponseEntity<?> getUserInfo(@RequestHeader("Authorization") String authHeader) {
        String url = keycloakBaseUrl + "/keycloak/userInfo";
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authHeader);
        HttpEntity<?> entity = new HttpEntity<>(headers);
        return restTemplate.exchange(url, HttpMethod.GET, entity, Object.class);
    }
}
```

**Frontend'de URL'i Değiştir:**

`.env` veya Cloudflare Pages environment variables:

```bash
# Keycloak URL'ini backend'e yönlendir
VITE_KEYCLOAK_BASE_URL=https://bff.your-domain.com  # Backend URL'i
```

Bu şekilde frontend → backend → keycloak şeklinde bir proxy zinciri oluşur ve CORS sorunu çözülür.

---

## 🔍 Test ve Doğrulama

### 1. CORS Headers Kontrolü

Browser Developer Tools > Network tab'inde OPTIONS isteğini kontrol edin:

```bash
# curl ile test
curl -X OPTIONS https://keycloak.iyihislerapp.com/keycloak/getToken \
  -H "Origin: https://54e90153.psikohekimfrontend.pages.dev" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

**Beklenen Response Headers:**
```
Access-Control-Allow-Origin: https://54e90153.psikohekimfrontend.pages.dev
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

### 2. Browser Console Kontrolü

Browser console'da CORS hatasının kaybolduğunu kontrol edin.

---

## 📝 Kontrol Listesi

- [ ] Keycloak servisinde CORS yapılandırması eklendi
- [ ] Cloudflare Pages URL pattern'i (`*.psikohekimfrontend.pages.dev`) allowed origins'a eklendi
- [ ] `/keycloak/**` endpoint'leri `permitAll()` listesinde
- [ ] `SecurityFilterChain`'de CORS aktif edildi
- [ ] Backend yeniden deploy edildi
- [ ] Browser console'da CORS hatası yok
- [ ] Login işlemi başarılı

---

## 🆘 Hala Çalışmıyor mu?

### Olası Sorunlar:

1. **Cache Sorunu:**
   - Browser cache'i temizleyin (Ctrl+Shift+R)
   - Cloudflare cache'i temizleyin

2. **Pattern Eşleşmiyor:**
   - `setAllowedOriginPatterns()` yerine `setAllowedOrigins()` kullanın ve tam URL'i ekleyin
   - Wildcard pattern'lerin doğru çalıştığından emin olun

3. **Credentials Sorunu:**
   - `allowCredentials(true)` kullanıyorsanız, origin'de wildcard (`*`) kullanamazsınız
   - Spesifik origin'ler kullanın

4. **Preflight Sorunu:**
   - OPTIONS metodunu açıkça handle ettiğinizden emin olun
   - `maxAge` ayarını kontrol edin

---

## 📞 Yardım

Sorun devam ederse:
1. Browser Network tab'inde request/response header'larını kontrol edin
2. Backend loglarını inceleyin
3. Keycloak servis loglarını kontrol edin

---

**Son Güncelleme:** 2025-01-XX

