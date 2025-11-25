# راهنمای بهینه‌سازی ویدیوی Spider RGB

## روش 1: استفاده از اسکریپت Python (نیاز به ffmpeg)

### نصب ffmpeg:

1. دانلود از: https://www.gyan.dev/ffmpeg/builds/
2. فایل ZIP را استخراج کنید
3. پوشه `bin` را به PATH اضافه کنید یا در `C:\ffmpeg\bin\` قرار دهید

### اجرای اسکریپت:

```bash
python optimize_spider_rgb.py videos/3d-preview_1.mp4
```

یا اگر نام فایل متفاوت است:

```bash
python optimize_spider_rgb.py <مسیر_فایل_ویدیو>
```

## روش 2: استفاده از ابزارهای آنلاین (ساده‌تر)

### گزینه 1: FreeConvert
- آدرس: https://www.freeconvert.com/video-compressor
- فایل را آپلود کنید
- تنظیمات:
  - **Quality**: High/Excellent
  - **Resolution**: 1920px width (maintain aspect ratio)
  - **Codec**: H.264
  - **Audio**: AAC 192kbps

### گزینه 2: Clipchamp
- آدرس: https://www.clipchamp.com/
- فایل را آپلود کنید
- کیفیت را روی "High" تنظیم کنید

### گزینه 3: HandBrake (نرم‌افزار دسکتاپ)
- دانلود: https://handbrake.fr/
- تنظیمات پیشنهادی:
  - **Video Codec**: H.264 (x264)
  - **Quality**: RF 20 (excellent quality)
  - **Resolution**: 1920px width
  - **Audio**: AAC 192kbps

## تنظیمات بهینه برای حفظ کیفیت:

- **Codec**: H.264 (libx264)
- **CRF/RF**: 20 (کیفیت عالی)
- **Resolution**: حداکثر 1920px عرض (نسبت تصویر حفظ شود)
- **Audio**: AAC با بیت‌ریت 192kbps
- **Preset**: veryslow (بهترین فشرده‌سازی)
- **Fast Start**: فعال (برای پخش آنلاین)

## پس از بهینه‌سازی:

1. فایل بهینه‌شده را در پوشه `videos/` قرار دهید
2. نام فایل را در `index.html` به‌روزرسانی کنید (اگر تغییر کرده)
3. Hard Refresh کنید (Ctrl+Shift+R)

## تخمین کاهش حجم:

با تنظیمات بالا، معمولاً 30-50% کاهش حجم بدون افت کیفیت قابل مشاهده حاصل می‌شود.

