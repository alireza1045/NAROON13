import json
import re
from pathlib import Path


def main():
    data = Path('gallery-data.json').read_text(encoding='utf-8')
    html_path = Path('gallery.html')
    html = html_path.read_text(encoding='utf-8')

    pattern = r"window\.__GALLERY_MANIFEST__ = \{.*?\};"
    replacement = f"window.__GALLERY_MANIFEST__ = {data};"

    new_html, count = re.subn(pattern, replacement, html, flags=re.S)
    if count == 0:
        raise SystemExit('Manifest placeholder not found in gallery.html')

    html_path.write_text(new_html, encoding='utf-8')


if __name__ == '__main__':
    main()

