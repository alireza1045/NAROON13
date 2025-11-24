"""
Flask Application for NAROON Website
اپلیکیشن Flask برای سایت نارون
"""
from flask import Flask, send_from_directory, send_file, request
from pathlib import Path
import os

# مسیر دایرکتوری ریشه
BASE_DIR = Path(__file__).parent

app = Flask(__name__,
            static_folder='static',
            static_url_path='/static',
            template_folder=str(BASE_DIR))


@app.after_request
def add_cache_headers(response):
    """اضافه کردن هدرهای کش برای فایل‌های استاتیک"""
    if response.status_code == 200:
        # Cache static files (CSS, JS, JSON) for 1 hour
        if request.path.startswith('/static/'):
            if request.path.endswith(('.css', '.js', '.json')):
                response.headers['Cache-Control'] = 'public, max-age=3600'
            # Cache fonts and other static assets longer
            elif request.path.endswith(('.woff', '.woff2', '.ttf', '.eot')):
                response.headers['Cache-Control'] = 'public, max-age=31536000, immutable'
    return response


@app.route('/')
def index():
    """صفحه اصلی"""
    response = send_file(BASE_DIR / 'index.html')
    response.headers['Cache-Control'] = 'public, max-age=3600'
    return response


@app.route('/gallery.html')
def gallery():
    """صفحه گالری"""
    response = send_file(BASE_DIR / 'gallery.html')
    response.headers['Cache-Control'] = 'public, max-age=3600'
    return response


@app.route('/errorr.html')
def errorr():
    """صفحه محصولات ERRORR"""
    response = send_file(BASE_DIR / 'errorr.html')
    response.headers['Cache-Control'] = 'public, max-age=3600'
    return response

# سرو کردن فایل‌های images


@app.route('/images/<path:filename>')
def serve_images(filename):
    """سرو کردن فایل‌های images"""
    response = send_from_directory(BASE_DIR / 'images', filename)
    # Cache images for 1 year (immutable)
    response.headers['Cache-Control'] = 'public, max-age=31536000, immutable'
    return response

# سرو کردن فایل‌های videos


@app.route('/videos/<path:filename>')
def serve_videos(filename):
    """سرو کردن فایل‌های videos"""
    response = send_from_directory(BASE_DIR / 'videos', filename)
    # Cache videos for 1 year (immutable)
    response.headers['Cache-Control'] = 'public, max-age=31536000, immutable'
    return response

# سرو کردن favicon و فایل‌های دیگر در root


@app.route('/favicon.ico')
def favicon():
    """سرو کردن favicon"""
    favicon_path = BASE_DIR / 'favicon.ico'
    if favicon_path.exists():
        response = send_file(favicon_path)
        response.headers['Cache-Control'] = 'public, max-age=31536000, immutable'
        return response
    return '', 404


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)
