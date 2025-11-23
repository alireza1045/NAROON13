#!/usr/bin/env python3
"""
اسکریپت برای به‌روزرسانی خودکار لیست فایل‌های ERRORR
این اسکریپت فایل‌های موجود در فولدر images/errorr-products را پیدا می‌کند
و لیست آن‌ها را در فایل errorr-media.json ذخیره می‌کند
"""

import json
from pathlib import Path

BASE_DIR = Path(__file__).parent
ERRORR_DIR = BASE_DIR / "images" / "errorr-products"
VIDEOS_DIR = BASE_DIR / "videos"
OUTPUT_FILE = BASE_DIR / "errorr-media.json"

# پسوندهای مجاز برای عکس
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'}

# پسوندهای مجاز برای ویدیو
VIDEO_EXTENSIONS = {'.mp4', '.webm', '.ogg', '.mov', '.avi'}

def gather_errorr_media() -> list[str]:
    """
    تمام فایل‌های عکس و ویدیو را از فولدر errorr-products و videos جمع‌آوری می‌کند
    به صورت بازگشتی (recursive) در تمام زیرفولدرها جستجو می‌کند
    """
    media_files = []
    
    # پیدا کردن عکس‌ها از فولدر errorr-products
    if ERRORR_DIR.exists():
        for file_path in sorted(ERRORR_DIR.rglob('*')):
            if file_path.is_file():
                ext = file_path.suffix.lower()
                if ext in IMAGE_EXTENSIONS or ext in VIDEO_EXTENSIONS:
                    # مسیر نسبی از ریشه پروژه
                    relative_path = str(file_path.relative_to(BASE_DIR)).replace("\\", "/")
                    media_files.append(relative_path)
    
    # پیدا کردن ویدیوها از فولدر videos (فقط فایل‌های جدید ERRORR)
    if VIDEOS_DIR.exists():
        for file_path in sorted(VIDEOS_DIR.iterdir()):
            if file_path.is_file():
                ext = file_path.suffix.lower()
                if ext in VIDEO_EXTENSIONS:
                    # فقط ویدیوهای جدید ERRORR را اضافه کن (مثلاً IMG_4076)
                    if '4076' in file_path.name or 'errorr' in file_path.name.lower():
                        relative_path = str(file_path.relative_to(BASE_DIR)).replace("\\", "/")
                        media_files.append(relative_path)
    
    return media_files

def main():
    import sys
    import io
    
    # تنظیم encoding برای Windows
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    
    print("در حال اسکن فولدر errorr-products...")
    
    media_files = gather_errorr_media()
    
    if not media_files:
        print("⚠️  هیچ فایل عکس یا ویدیویی پیدا نشد!")
        print(f"لطفاً فایل‌های خود را در فولدر {ERRORR_DIR} قرار دهید.")
    else:
        print(f"✓ {len(media_files)} فایل پیدا شد:")
        for file in media_files:
            print(f"  - {file}")
    
    # ذخیره در فایل JSON
    output_data = {
        "files": media_files
    }
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✓ لیست فایل‌ها در {OUTPUT_FILE} ذخیره شد.")

if __name__ == "__main__":
    main()

