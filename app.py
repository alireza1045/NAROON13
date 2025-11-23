"""
Flask Application for NAROON Website
اپلیکیشن Flask برای سایت نارون
"""
from flask import Flask, send_from_directory, send_file
from pathlib import Path
import os

app = Flask(__name__, static_folder='static', static_url_path='')

# مسیر دایرکتوری ریشه
BASE_DIR = Path(__file__).parent

@app.route('/')
def index():
    """صفحه اصلی"""
    return send_file(BASE_DIR / 'index.html')

@app.route('/gallery.html')
def gallery():
    """صفحه گالری"""
    return send_file(BASE_DIR / 'gallery.html')

@app.route('/errorr.html')
def errorr():
    """صفحه محصولات ERRORR"""
    return send_file(BASE_DIR / 'errorr.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """سرو کردن فایل‌های استاتیک"""
    # بررسی اینکه آیا فایل در root وجود دارد
    file_path = BASE_DIR / filename
    if file_path.exists() and file_path.is_file():
        return send_file(file_path)
    
    # اگر فایل در static وجود دارد
    static_path = BASE_DIR / 'static' / filename
    if static_path.exists() and static_path.is_file():
        return send_file(static_path)
    
    # اگر فایل در images وجود دارد
    images_path = BASE_DIR / 'images' / filename
    if images_path.exists() and images_path.is_file():
        return send_file(images_path)
    
    # اگر فایل در videos وجود دارد
    videos_path = BASE_DIR / 'videos' / filename
    if videos_path.exists() and videos_path.is_file():
        return send_file(videos_path)
    
    # در غیر این صورت 404
    return "File not found", 404

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)

