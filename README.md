# WhatsApp Play Integrity Test Automation

Bu repo WhatsApp kayıt protokolünü test etmek için GitHub Actions ile otomatik test ortamı sağlar.

## Özellikler

- ✅ Redroid (Docker Android) ortamı
- ✅ Play Integrity bypass analizi
- ✅ WhatsApp APK test
- ✅ Frida hook scriptleri
- ✅ Otomatik SMS test

## Test Mimarisi

```
GitHub Actions (Ubuntu Runner)
  ↓
Docker (Redroid - Android 11)
  ↓
WhatsApp APK
  ↓
Play Integrity Analysis
  ↓
Token Generation Test
```

## Kullanım

GitHub Actions sekmesine git ve "WhatsApp Test" workflow'unu manuel tetikle.

## Test Sonuçları

Her çalıştırmada:
- Play Integrity token analizi
- Device fingerprint kontrolü
- SMS kayıt protokolü testi

## Teknik Detaylar

- **Android Sürümü**: 11
- **Test Numarası**: 13322549345
- **Bypass Yöntemi**: Magisk + Play Integrity Fix
