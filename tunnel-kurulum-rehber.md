# Cloudflare Tunnel Connector Token Alma

## Yöntem 1: Connector'ı Silip Yeniden Oluşturma (Önerilen)

1. **Cloudflare Dashboard** → Zero Trust → Networks → Tunnels
2. `psikohekim-backend` tunnel'ına tıklayın
3. **"Connectors"** sekmesine gidin
4. Mevcut connector varsa, **"Delete"** butonuna tıklayın (Tunnel silinmez, sadece connector silinir)
5. **"Create Connector"** butonuna tıklayın
6. **Token görünecek** - bunu kopyalayın!

## Yöntem 2: Config Dosyasından Token Alma

Eğer connector zaten kurulmuşsa, config dosyasından kontrol edin:

```bash
cat ~/.cloudflared/config.yml
```

Veya JSON dosyasından:

```bash
cat ~/.cloudflared/[TUNNEL_ID].json
```

## Yöntem 3: CLI ile Token Oluşturma

Terminal'de:

```bash
# Tunnel'ı yeniden oluştur (token almak için)
cloudflared tunnel create psikohekim-backend

# Veya mevcut tunnel için connector ekle
cloudflared tunnel route dns psikohekim-backend keycloak.iyihislerapp.com
```

## Hızlı Çözüm: Yeni Connector Oluştur

Dashboard'da:
1. Tunnel → **Connectors** sekmesi
2. **"Create Connector"** butonuna tıklayın
3. Token görünecek - **kopyalayın**
4. Terminal'de:
   ```bash
   cd /Users/fs648/Desktop/PsikoHekim/PsikoHekimFrontend
   ./start-named-tunnel.sh
   ```
5. Token'ı yapıştırın

