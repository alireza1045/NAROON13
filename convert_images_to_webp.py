from __future__ import annotations

import sys
from pathlib import Path
from typing import Dict, List, Tuple

from PIL import Image, UnidentifiedImageError


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG"}
TEXT_EXTENSIONS = {".html", ".css", ".js", ".json", ".md", ".py", ".txt"}
REFERENCE_PREFIXES = [
    "",
    "./",
    "../",
    "/",
    "https://naroonsignmaker.com/",
    "https://www.naroonsignmaker.com/",
    "http://naroonsignmaker.com/",
    "http://www.naroonsignmaker.com/",
]


def normalize_path(path: Path, root: Path) -> str:
    return path.relative_to(root).as_posix()


def convert_image(source: Path, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as img:
        if img.mode not in ("RGB", "RGBA"):
            if "transparency" in img.info or img.mode in ("P", "LA"):
                img = img.convert("RGBA")
            else:
                img = img.convert("RGB")
        img.save(destination, "WEBP", quality=85, method=6)


def gather_text_files(root: Path) -> List[Path]:
    text_files: List[Path] = []
    for path in root.rglob("*"):
        if path.is_file() and path.suffix in TEXT_EXTENSIONS:
            text_files.append(path)
    return text_files


def update_references(text_files: List[Path], replacements: Dict[str, str]) -> int:
    total_updates = 0
    for file_path in text_files:
        try:
            original_content = file_path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue

        updated_content = original_content
        for old, new in replacements.items():
            updated_content = updated_content.replace(old, new)

        if updated_content != original_content:
            file_path.write_text(updated_content, encoding="utf-8")
            total_updates += 1
    return total_updates


def build_replacement_map(converted_pairs: List[Tuple[str, str]]) -> Dict[str, str]:
    replacements: Dict[str, str] = {}
    for old_rel, new_rel in converted_pairs:
        base_old = old_rel
        base_new = new_rel
        variants = set()
        for prefix in REFERENCE_PREFIXES:
            variants.add(prefix + base_old)
        # Add Windows-style path variants
        variants.add(base_old.replace("/", "\\"))
        variants.add("./" + base_old.replace("/", "\\"))
        for variant in variants:
            replacements[variant] = variant.replace(base_old, base_new)
    return replacements


def main() -> None:
    root = Path(__file__).parent
    images_dir = root / "images"
    if not images_dir.exists():
        print("images directory not found", file=sys.stderr)
        sys.exit(1)

    converted_pairs: List[Tuple[str, str]] = []
    errors: List[Tuple[str, str]] = []

    for image_path in images_dir.rglob("*"):
        if image_path.is_file() and image_path.suffix in IMAGE_EXTENSIONS:
            webp_path = image_path.with_suffix(".webp")
            if webp_path.exists():
                continue
            try:
                convert_image(image_path, webp_path)
                converted_pairs.append(
                    (
                        normalize_path(image_path, root),
                        normalize_path(webp_path, root),
                    )
                )
                image_path.unlink()
            except (UnidentifiedImageError, OSError) as exc:
                errors.append((str(image_path), str(exc)))

    if not converted_pairs:
        print("No new images were converted. Exiting.")
        return

    replacements = build_replacement_map(converted_pairs)
    text_files = gather_text_files(root)
    updated_files_count = update_references(text_files, replacements)

    print(f"Converted {len(converted_pairs)} images to WebP.")
    print(f"Updated references in {updated_files_count} text files.")

    if errors:
        print("The following images could not be processed:", file=sys.stderr)
        for path_str, error_msg in errors:
            print(f"- {path_str}: {error_msg}", file=sys.stderr)


if __name__ == "__main__":
    main()

