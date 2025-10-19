# 🚇 PsikoHekim Cloudflare Tunnel Deployment Rehberi

## 📋 Genel Bakış

Bu rehber, backend'inizi kendi bilgisayarınızda Docker Compose ile çalıştırıp, **sadece BFF (Backend For Frontend)** servisini Cloudflare Tunnel ile dışarıya açmayı anlatır.

### 🎯 Avantajlar

- ✅ **Tamamen ücretsiz**
- ✅ Backend servisleriniz güvende (local network)
- ✅ Keycloak, Camunda, Postgres içerde kalır
- ✅ Sadece BFF dışarıdan erişilebilir
- ✅ Zero-trust security (Cloudflare)
- ✅ Otomatik HTTPS
- ✅ Kolay yönetim

### 📐 Mimari

```
┌─────────────────────────────────────────┐
│  Cloudflare Pages (Frontend)            │
│  https://psikohekim.pages.dev           │
└──────────────────┬──────────────────────┘
                   │
                   │ HTTPS
                   ▼
┌─────────────────────────────────────────┐
│  Cloudflare Tunnel                      │
│  https://bff.your-domain.com            │
└──────────────────┬──────────────────────┘
                   │
                   │ Local Network
                   ▼
┌─────────────────────────────────────────┐
│  Docker Compose (Local)                 │
│  ┌─────────────────────────────────┐   │
│  │ BFF (8083) ← Tunnel buraya      │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ Keycloak (6700) ← İçerde        │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ Camunda/BPMN (8082) ← İçerde    │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ PostgreSQL (5432) ← İçerde      │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 🚀 Adım Adım Kurulum

### 1️⃣ Cloudflare Tunnel Kurulumu

#### Adım 1: Cloudflare Zero Trust Hesabı

1. [Cloudflare Dashboard](https://dash.cloudflare.com) > **Zero Trust**
2. **Create a Team** (ilk seferinizse)
3. Team adı girin (örn: `psikohekim-team`)

#### Adım 2: Cloudflared CLI Kurulumu

**macOS:**
```bash
brew install cloudflared
```

**Linux:**
```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

**Windows:**
```powershell
# PowerShell (Admin)
winget install --id Cloudflare.cloudflared
```

#### Adım 3: Cloudflare'de Login

```bash
cloudflared tunnel login
```

Bu komut browser açacak ve Cloudflare'de authenticate olacaksınız.

---

### 2️⃣ Tunnel Oluşturma

#### Adım 1: Tunnel Oluştur

```bash
cloudflared tunnel create psikohekim-backend
```

**Çıktı:**
```
Tunnel credentials written to /Users/yourusername/.cloudflared/UUID.json
Created tunnel psikohekim-backend with id UUID
```

**Tunnel ID'yi not edin!** ✏️

#### Adım 2: Tunnel Konfigürasyonu

Config dosyası oluşturun:

```bash
nano ~/.cloudflared/config.yml
```

**Aşağıdaki içeriği ekleyin:**

```yaml
# Cloudflare Tunnel Configuration
tunnel: YOUR_TUNNEL_ID  # Yukarıda aldığınız tunnel ID
credentials-file: /Users/yourusername/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  # BFF servisinizi tunnel'a bağlayın
  - hostname: bff.your-domain.com
    service: http://localhost:8083
    originRequest:
      noTLSVerify: true
  
  # Fallback (zorunlu)
  - service: http_status:404
```

**⚠️ Değiştirmeniz gerekenler:**
- `YOUR_TUNNEL_ID`: Tunnel oluştururken aldığınız ID
- `bff.your-domain.com`: Kullanmak istediğiniz subdomain
- `http://localhost:8083`: BFF servisinizin local port'u

---

### 3️⃣ DNS Kaydı Oluşturma

#### Cloudflare Dashboard'da:

```bash
cloudflared tunnel route dns psikohekim-backend bff.your-domain.com
```

**VEYA** manuel olarak:
1. Cloudflare Dashboard > Your Domain > DNS
2. Add record:
   - Type: `CNAME`
   - Name: `bff`
   - Target: `YOUR_TUNNEL_ID.cfargotunnel.com`
   - Proxy: ✅ Proxied

---

### 4️⃣ Docker Compose ile Backend Başlatma

#### Adım 1: Docker Compose Dosyanızı Hazırlayın

Backend projenizde `docker-compose.yml` dosyanız olmalı. Örnek:

```yaml
version: '3.8'

services:
  bff:
    build: ./bff
    ports:
      - "8083:8083"
    environment:
      - KEYCLOAK_URL=http://keycloak:6700
      - BPMN_URL=http://camunda:8082
      - DB_HOST=postgres
    depends_on:
      - keycloak
      - camunda
      - postgres
    networks:
      - psikohekim-network

  keycloak:
    image: quay.io/keycloak/keycloak:latest
    ports:
      - "6700:6700"
    environment:
      - KEYCLOAK_ADMIN=admin
      - KEYCLOAK_ADMIN_PASSWORD=admin
    networks:
      - psikohekim-network

  camunda:
    image: camunda/camunda-bpm-platform:latest
    ports:
      - "8082:8080"
    networks:
      - psikohekim-network

  postgres:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=psikohekim
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=psikohekim
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - psikohekim-network

networks:
  psikohekim-network:
    driver: bridge

volumes:
  postgres-data:
```

#### Adım 2: Backend'i Başlatın

```bash
# Backend projenizin dizinine gidin
cd /path/to/backend

# Docker Compose ile başlatın
docker-compose up -d
```

#### Adım 3: Servislerin Çalıştığını Kontrol Edin

```bash
docker-compose ps
```

Tüm servisler "Up" durumunda olmalı.

---

### 5️⃣ Cloudflare Tunnel'ı Başlatma

#### Test Modu (Foreground):

```bash
cloudflared tunnel run psikohekim-backend
```

**Başarılı olursa:**
```
INF Connection registered connIndex=0
INF Each HA connection's tunnel IDs: map[0:YOUR_TUNNEL_ID]
```

#### Production Modu (Background Service):

**macOS/Linux:**
```bash
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

**Windows:**
```powershell
cloudflared service install
sc start cloudflared
```

---

### 6️⃣ Frontend Environment Variables Güncelleme

#### Adım 1: Cloudflare Pages Environment Variables

Cloudflare Dashboard > Workers & Pages > Your Frontend Project > Settings > Environment Variables

**Ekleyin:**

```bash
# BFF URL (Cloudflare Tunnel üzerinden)
VITE_PSIKOHEKIM_BASE_URL=https://bff.your-domain.com

# Keycloak (Tunnel üzerinden VEYA local - göreceğiz)
VITE_KEYCLOAK_BASE_URL=https://keycloak.your-domain.com

# BPMN (Internal - BFF üzerinden erişilecek)
VITE_BPMN_BASE_URL=https://bff.your-domain.com

# Patient Endpoints
VITE_PATIENT_LIST_URL=https://bff.your-domain.com/patient/all
VITE_PATIENT_DETAILS_URL=https://bff.your-domain.com/patient/details
VITE_PATIENT_SEARCH_URL=https://bff.your-domain.com/patient/search
VITE_PATIENT_ADD_URL=/patient/addPatient

# Therapist Endpoints
VITE_THERAPIST_LIST_URL=https://bff.your-domain.com/therapist/all
VITE_THERAPIST_DETAILS_URL=https://bff.your-domain.com/therapist/details
VITE_THERAPIST_SEARCH_URL=https://bff.your-domain.com/therapist/search
VITE_THERAPIST_ADD_URL=https://bff.your-domain.com/therapist/addTherapist

# Therapist-Patient
VITE_THERAPIST_PATIENT_PATIENTS_URL=https://bff.your-domain.com/therapist-patient

# Keycloak Endpoints (BFF üzerinden proxy'lenebilir)
VITE_KEYCLOAK_GET_TOKEN_URL=https://bff.your-domain.com/keycloak/getToken
VITE_KEYCLOAK_GET_USER_INFO_URL=https://bff.your-domain.com/keycloak/userInfo
VITE_KEYCLOAK_USERS_URL=https://bff.your-domain.com/users
```

#### Adım 2: Redeploy Frontend

Cloudflare Pages > Deployments > Retry deployment

---

## 🔐 Güvenlik ve CORS

### BFF CORS Ayarları

BFF'nizde CORS ayarlarını güncelleyin:

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

---

## 🎯 Keycloak İçin Özel Durum

Keycloak frontend'den **direkt erişim** gerektiriyorsa (browser redirect için), iki seçenek var:

### Seçenek A: Keycloak'ı da Tunnel'a ekleyin

`~/.cloudflared/config.yml` dosyasını güncelleyin:

```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /path/to/credentials.json

ingress:
  # BFF
  - hostname: bff.your-domain.com
    service: http://localhost:8083
    
  # Keycloak (frontend'den direkt erişim için)
  - hostname: keycloak.your-domain.com
    service: http://localhost:6700
  
  # Fallback
  - service: http_status:404
```

DNS kaydı ekleyin:
```bash
cloudflared tunnel route dns psikohekim-backend keycloak.your-domain.com
```

### Seçenek B: BFF'de Keycloak Proxy

BFF'nizde Keycloak isteklerini proxy edin (daha güvenli).

---

## 🧪 Test Etme

### 1. Tunnel Çalışıyor mu?

```bash
curl https://bff.your-domain.com/health
```

### 2. Frontend'den API Çağrısı

Browser console:
```javascript
fetch('https://bff.your-domain.com/patient/all')
  .then(r => r.json())
  .then(console.log)
```

### 3. Cloudflare Tunnel Status

```bash
cloudflared tunnel info psikohekim-backend
```

---

## 📊 Monitoring

### Cloudflare Dashboard

1. Zero Trust > Access > Tunnels
2. Tunnel'ınızı seçin
3. Metrics ve logs görüntüleyin

### Local Logs

```bash
# Systemd (Linux/macOS)
sudo journalctl -u cloudflared -f

# Docker logs
docker-compose logs -f bff
```

---

## 🆘 Sorun Giderme

### ❌ Problem: Tunnel bağlanamıyor

**Çözüm:**
```bash
# Tunnel'ı restart edin
sudo systemctl restart cloudflared

# Veya manuel test
cloudflared tunnel run psikohekim-backend
```

### ❌ Problem: 502 Bad Gateway

**Nedenleri:**
- BFF servisi çalışmıyor
- Port yanlış (8083'ü kontrol edin)
- Docker container down

**Çözüm:**
```bash
# Docker servislerini kontrol edin
docker-compose ps

# BFF loglarını inceleyin
docker-compose logs bff

# BFF'yi restart edin
docker-compose restart bff
```

### ❌ Problem: CORS hatası

**Çözüm:**
- BFF CORS ayarlarını kontrol edin
- Cloudflare Pages URL'ini allowed origins'a ekleyin
- BFF'yi restart edin

---

## 💰 Maliyet Karşılaştırması

| Yöntem | Aylık Maliyet | Notlar |
|--------|---------------|--------|
| **Cloudflare Tunnel** | **$0** | Tamamen ücretsiz, sınırsız |
| Railway | $0-20 | 500 saat/ay limit |
| Render | $0-7 | Free tier limited |
| DigitalOcean | $12+ | En ucuz droplet |
| Heroku | $7+ | Dyno maliyeti |

---

## 🎉 Sonuç

Artık backend'iniz kendi bilgisayarınızda güvenle çalışıyor ve sadece BFF dışarıdan erişilebilir durumda!

### ✅ Avantajlar:
- Tamamen ücretsiz
- Güvenli (Zero Trust)
- Kolay yönetim
- Hızlı development
- Cloudflare'in global CDN'i

### 🔄 Güncellemeler

Backend kodunuzda değişiklik yapınca:
```bash
# Rebuild ve restart
docker-compose up -d --build
```

Tunnel otomatik olarak yeni versiyonu serve edecek!

---

## 📚 Ek Kaynaklar

- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Zero Trust Dashboard](https://dash.teams.cloudflare.com/)

---

**Son güncelleme:** 2025-10-12
**Tahmini kurulum süresi:** 15-20 dakika

