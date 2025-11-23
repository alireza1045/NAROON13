"""
Flask Application for NAROON Website
اپلیکیشن Flask برای سایت نارون
"""
from flask import Flask, send_from_directory, send_file
from pathlib import Path
import os

# مسیر دایرکتوری ریشه
BASE_DIR = Path(__file__).parent

app = Flask(__name__,
            static_folder='static',
            static_url_path='/static',
            template_folder=str(BASE_DIR))


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

# سرو کردن فایل‌های images


@app.route('/images/<path:filename>')
def serve_images(filename):
    """سرو کردن فایل‌های images"""
    return send_from_directory(BASE_DIR / 'images', filename)

# سرو کردن فایل‌های videos


@app.route('/videos/<path:filename>')
def serve_videos(filename):
    """سرو کردن فایل‌های videos"""
    return send_from_directory(BASE_DIR / 'videos', filename)

# سرو کردن favicon و فایل‌های دیگر در root


@app.route('/favicon.ico')
def favicon():
    """سرو کردن favicon"""
    favicon_path = BASE_DIR / 'favicon.ico'
    if favicon_path.exists():
        return send_file(favicon_path)
    return '', 404


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)
