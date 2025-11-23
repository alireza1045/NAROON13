"""
Simple HTTP Server for NAROON Website
سرور ساده HTTP برای سایت نارون
"""
import http.server
import socketserver
import os
import sys
from pathlib import Path

# تنظیم پورت از متغیر محیطی یا استفاده از پورت پیش‌فرض (مطابق liara.json)
PORT = int(os.environ.get('PORT', 3000))

# مسیر دایرکتوری فعلی
DIRECTORY = Path(__file__).parent

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Handler سفارشی برای مدیریت درخواست‌ها"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)
    
    def end_headers(self):
        # اضافه کردن هدرهای امنیتی و بهینه‌سازی
        self.send_header('Cache-Control', 'public, max-age=3600')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        super().end_headers()
    
    def log_message(self, format, *args):
        # لاگ ساده برای لینارا
        sys.stderr.write("%s - - [%s] %s\n" %
                        (self.address_string(),
                         self.log_date_time_string(),
                         format % args))

def main():
    """شروع سرور HTTP"""
    try:
        with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
            print(f"Server starting on port {PORT}")
            print(f"Serving directory: {DIRECTORY}")
            print(f"Access the site at: http://localhost:{PORT}")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

