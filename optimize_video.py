"""
Video Optimization Script
Compresses video file size while maintaining quality using H.264 codec
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
    try:
        subprocess.run(['ffmpeg', '-version'], 
                      capture_output=True, check=True,
                      creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == 'win32' else 0)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def optimize_video_ffmpeg(input_file, output_file, quality='23'):
    """
    Optimize video using ffmpeg with H.264 codec
    quality: 18-28 (lower = better quality, larger file)
             23 is recommended (good balance)
    """
    if not os.path.exists(input_file):
        print(f"Error: File {input_file} not found!")
        return False
    
    original_size = os.path.getsize(input_file) / (1024 * 1024)
    print(f"Original file size: {original_size:.2f} MB")
    
    # FFmpeg command for high-quality compression
    cmd = [
        'ffmpeg',
        '-i', input_file,
        '-c:v', 'libx264',           # H.264 codec
        '-crf', quality,              # Quality (18-28, 23 is good)
        '-preset', 'slow',            # Slower encoding = better compression
        '-vf', 'scale=1920:-2',       # Limit width to 1920px, maintain aspect ratio
        '-c:a', 'aac',                # Audio codec
        '-b:a', '128k',               # Audio bitrate
        '-movflags', '+faststart',    # Enable web optimization
        '-pix_fmt', 'yuv420p',        # Compatibility with all browsers
        '-y',                         # Overwrite output
        output_file
    ]
    
    try:
        print("Optimizing video... This may take a few minutes...")
        result = subprocess.run(cmd, capture_output=True, text=True,
                              creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == 'win32' else 0)
        
        if result.returncode == 0 and os.path.exists(output_file):
            new_size = os.path.getsize(output_file) / (1024 * 1024)
            reduction = ((original_size - new_size) / original_size) * 100
            print(f"SUCCESS: Optimization complete!")
            print(f"New file size: {new_size:.2f} MB")
            print(f"Size reduction: {reduction:.1f}%")
            return True
        else:
            print("Error during optimization")
            if result.stderr:
                # Print last 300 chars of error
                error_msg = result.stderr[-300:] if len(result.stderr) > 300 else result.stderr
                print(error_msg)
            return False
    except FileNotFoundError:
        print("Error: ffmpeg not found. Please install ffmpeg first.")
        return False

def optimize_video_simple(input_file, output_file):
    """Simpler method with more compression"""
    if not check_ffmpeg():
        return False
    
    if not os.path.exists(input_file):
        print(f"Error: File {input_file} not found!")
        return False
    
    original_size = os.path.getsize(input_file) / (1024 * 1024)
    print(f"Original file size: {original_size:.2f} MB")
    
    # Simpler: reduce resolution and bitrate more
    cmd = [
        'ffmpeg',
        '-i', input_file,
        '-c:v', 'libx264',
        '-crf', '28',                 # More compression
        '-preset', 'medium',
        '-vf', 'scale=1280:-2',       # Reduce resolution to 1280px width
        '-c:a', 'aac',
        '-b:a', '96k',
        '-movflags', '+faststart',
        '-pix_fmt', 'yuv420p',
        '-y',
        output_file
    ]
    
    try:
        print("Optimizing video (simple method)...")
        result = subprocess.run(cmd, capture_output=True, text=True,
                              creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == 'win32' else 0)
        
        if result.returncode == 0 and os.path.exists(output_file):
            new_size = os.path.getsize(output_file) / (1024 * 1024)
            reduction = ((original_size - new_size) / original_size) * 100
            print(f"SUCCESS: Optimization complete!")
            print(f"New file size: {new_size:.2f} MB")
            print(f"Size reduction: {reduction:.1f}%")
            return True
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    video_dir = 'videos'
    
    # Find video files
    video_files = []
    if os.path.exists(video_dir):
        for file in os.listdir(video_dir):
            if file.lower().endswith(('.mp4', '.avi', '.mov', '.mkv', '.webm')):
                full_path = os.path.join(video_dir, file)
                if os.path.isfile(full_path):
                    video_files.append(full_path)
    
    if not video_files:
        print("No video files found in 'videos' directory!")
        return
    
    print("=" * 60)
    print("Video Optimization Tool")
    print("=" * 60)
    print(f"\nFound {len(video_files)} video file(s):")
    for i, file in enumerate(video_files, 1):
        size = os.path.getsize(file) / (1024 * 1024)
        name = os.path.basename(file)
        print(f"  {i}. {name} ({size:.2f} MB)")
    
    # Optimize the first video file
    input_file = video_files[0]
    filename = os.path.basename(input_file)
    name, ext = os.path.splitext(filename)
    output_file = os.path.join(video_dir, f"{name}_optimized{ext}")
    
    print(f"\nOptimizing: {filename}")
    print(f"Output will be: {os.path.basename(output_file)}")
    print("-" * 60)
    
    # Method 1: High quality with ffmpeg
    if check_ffmpeg():
        print("\nUsing ffmpeg (high quality)...")
        if optimize_video_ffmpeg(input_file, output_file, quality='23'):
            print(f"\nOptimized video saved to: {output_file}")
            print("\nNote: Original file is preserved.")
            print("You can check the optimized file and delete the original if satisfied.")
            return
    
    # Method 2: Simpler compression
    print("\nTrying simpler method...")
    if optimize_video_simple(input_file, output_file):
        print(f"\nOptimized video saved to: {output_file}")
        return
    
    print("\nERROR: Could not optimize video.")
    print("\nPlease install ffmpeg:")
    print("  - Download: https://ffmpeg.org/download.html")
    print("  - Or install via: pip install ffmpeg-python")
    print("\nAlternatively, you can use online tools like:")
    print("  - https://www.freeconvert.com/video-compressor")
    print("  - https://www.media.io/video-compressor.html")

if __name__ == "__main__":
    main()
