import json
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
IMAGES_DIR = BASE_DIR / "images"

CATEGORIES = [
    "exhibition",
    "polygon-3d",
    "channel-letters",
    "steel-letters",
    "metal-letters",
    "plastic-letters",
    "european",
    "lightbox",
    "neon-plex",
    "led",
    "led-display",
    "traffic-signs",
]

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"}


def gather_images_for_category(category: str) -> list[str]:
    category_path = IMAGES_DIR / category
    if not category_path.exists():
        return []

    image_paths = [
        path for path in category_path.iterdir()
        if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
    ]

    image_paths.sort(
        key=lambda p: (p.stat().st_mtime, p.name.lower()),
        reverse=True
    )

    return [str(path.relative_to(BASE_DIR)).replace("\\", "/") for path in image_paths]


def main():
    manifest = {}
    for category in CATEGORIES:
        manifest[category] = gather_images_for_category(category)

    manifest_path = BASE_DIR / "gallery-data.json"
    manifest_json = json.dumps(manifest, ensure_ascii=False, indent=4)
    manifest_path.write_text(manifest_json, encoding="utf-8")


if __name__ == "__main__":
    main()


