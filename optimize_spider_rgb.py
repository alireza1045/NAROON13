"""
Optimize Spider RGB Video
Compresses video file size while maintaining high quality
"""
import os
import subprocess
import sys

# Set UTF-8 encoding for console
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

def check_ffmpeg():
    """Check if ffmpeg is available"""
    # Try common paths on Windows
    possible_paths = [
        'ffmpeg',
        'C:\\ffmpeg\\bin\\ffmpeg.exe',
        'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe',
        'C:\\Program Files (x86)\\ffmpeg\\bin\\ffmpeg.exe',
    ]
    
    for ffmpeg_path in possible_paths:
        try:
            subprocess.run([ffmpeg_path, '-version'], 
                          capture_output=True, check=True,
                          creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == 'win32' else 0)
            return ffmpeg_path
        except (subprocess.CalledProcessError, FileNotFoundError):
            continue
    
    print("=" * 60)
    print("ERROR: ffmpeg not found!")
    print("=" * 60)
    print("\nTo optimize videos, you need to install ffmpeg:")
    print("\n1. Download ffmpeg from: https://ffmpeg.org/download.html")
    print("   Or use: https://www.gyan.dev/ffmpeg/builds/")
    print("\n2. Extract and add to PATH, or place in C:\\ffmpeg\\bin\\")
    print("\n3. Alternatively, you can use online tools like:")
    print("   - https://www.freeconvert.com/video-compressor")
    print("   - https://www.clipchamp.com/")
    print("\nRecommended settings for Spider RGB video:")
    print("  - Codec: H.264")
    print("  - Quality: High/Excellent (CRF 20)")
    print("  - Resolution: 1920px width (maintain aspect ratio)")
    print("  - Audio: AAC 192kbps")
    print("=" * 60)
    return None

def optimize_spider_rgb(input_file, output_file=None, ffmpeg_path='ffmpeg'):
    """
    Optimize Spider RGB video with high quality settings
    Uses CRF 20 for excellent quality with good compression
    """
    if not os.path.exists(input_file):
        print(f"Error: File {input_file} not found!")
        return False
    
    if output_file is None:
        name, ext = os.path.splitext(input_file)
        output_file = f"{name}_optimized{ext}"
    
    original_size = os.path.getsize(input_file) / (1024 * 1024)
    print(f"Original file: {input_file}")
    print(f"Original size: {original_size:.2f} MB")
    print(f"Optimizing to: {output_file}")
    print("This may take a few minutes...")
    
    # FFmpeg command for high-quality compression (CRF 20 = excellent quality)
    cmd = [
        ffmpeg_path,
        '-i', input_file,
        '-c:v', 'libx264',           # H.264 codec
        '-crf', '20',                 # Quality: 20 = excellent (18-28 range, lower = better)
        '-preset', 'veryslow',        # Slowest = best compression
        '-tune', 'film',              # Optimize for film/video content
        '-vf', 'scale=1920:-2',       # Limit width to 1920px, maintain aspect ratio
        '-c:a', 'aac',                # Audio codec
        '-b:a', '192k',               # High quality audio bitrate
        '-movflags', '+faststart',    # Enable web optimization (streaming ready)
        '-pix_fmt', 'yuv420p',        # Compatibility with all browsers
        '-profile:v', 'high',         # H.264 high profile
        '-level', '4.0',              # H.264 level 4.0
        '-y',                         # Overwrite output
        output_file
    ]
    
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == 'win32' else 0
        )
        
        if result.returncode == 0:
            if os.path.exists(output_file):
                new_size = os.path.getsize(output_file) / (1024 * 1024)
                reduction = ((original_size - new_size) / original_size) * 100
                print(f"\n✓ Optimization complete!")
                print(f"New size: {new_size:.2f} MB")
                print(f"Size reduction: {reduction:.1f}%")
                print(f"Quality: Excellent (CRF 20)")
                return True
            else:
                print("Error: Output file was not created!")
                return False
        else:
            print(f"Error during optimization:")
            print(result.stderr)
            return False
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    # Check for Spider RGB video files
    video_dir = "videos"
    possible_files = [
        "videos/3d-preview_1.mp4",
        "videos/IMG_4076_1_1.mp4"
    ]
    
    print("Searching for Spider RGB video...")
    
    # Try to find the video
    video_file = None
    for file_path in possible_files:
        if os.path.exists(file_path):
            print(f"Found: {file_path}")
            video_file = file_path
            break
    
    if not video_file:
        print("Spider RGB video not found in common locations.")
        print("Please specify the video file path:")
        if len(sys.argv) > 1:
            video_file = sys.argv[1]
        else:
            print("Usage: python optimize_spider_rgb.py <video_file>")
            sys.exit(1)
    
    ffmpeg_path = check_ffmpeg()
    if not ffmpeg_path:
        sys.exit(1)
    
    optimize_spider_rgb(video_file, ffmpeg_path=ffmpeg_path)

