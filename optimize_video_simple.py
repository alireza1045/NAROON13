"""
Simple Video Optimization using moviepy
"""
import os
import sys

def optimize_with_moviepy(input_file, output_file):
    """Optimize video using moviepy"""
    try:
        from moviepy.editor import VideoFileClip
        import subprocess
        
        if not os.path.exists(input_file):
            print(f"Error: File {input_file} not found!")
            return False
        
        original_size = os.path.getsize(input_file) / (1024 * 1024)
        print(f"Original file size: {original_size:.2f} MB")
        
        print("Loading video (this may take a moment)...")
        clip = VideoFileClip(input_file)
        
        duration = clip.duration
        fps = clip.fps
        w, h = clip.size
        
        print(f"Video info: {int(w)}x{int(h)} @ {fps}fps ({duration:.1f}s)")
        
        # Resize if too large (max 1920 width for desktop)
        max_width = 1920
        if w > max_width:
            new_height = int((max_width / w) * h)
            print(f"Resizing to {max_width}x{new_height} for optimization...")
            clip = clip.resize((max_width, new_height))
        
        print("Optimizing and writing video (this will take several minutes)...")
        print("Please be patient...")
        
        # Write with compression
        clip.write_videofile(
            output_file,
            codec='libx264',
            bitrate='2000k',  # Good quality bitrate
            audio_codec='aac',
            audio_bitrate='128k',
            preset='medium',  # Balance between speed and compression
            threads=4,
            verbose=False,
            logger=None,
            temp_audiofile='temp-audio.m4a',
            remove_temp=True
        )
        
        clip.close()
        
        if os.path.exists(output_file):
            new_size = os.path.getsize(output_file) / (1024 * 1024)
            reduction = ((original_size - new_size) / original_size) * 100
            print(f"\nSUCCESS: Optimization complete!")
            print(f"New file size: {new_size:.2f} MB")
            print(f"Size reduction: {reduction:.1f}%")
            return True
        return False
        
    except ImportError:
        print("Installing moviepy...")
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'moviepy', '-q'])
        # Try again after installation
        return optimize_with_moviepy(input_file, output_file)
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    video_dir = 'videos'
    
    # Find the newest video file
    video_files = []
    if os.path.exists(video_dir):
        for file in os.listdir(video_dir):
            if file.lower().endswith(('.mp4', '.avi', '.mov', '.mkv', '.webm')):
                full_path = os.path.join(video_dir, file)
                if os.path.isfile(full_path) and not file.endswith('_optimized.mp4'):
                    video_files.append(full_path)
    
    if not video_files:
        print(f"Error: No video files found in '{video_dir}' directory!")
        return
    
    # Get the most recent file (or use first one)
    input_file = max(video_files, key=os.path.getmtime)
    
    filename = os.path.basename(input_file)
    name, ext = os.path.splitext(filename)
    output_file = os.path.join(video_dir, f"{name}_optimized{ext}")
    
    print("=" * 60)
    print("Video Optimization Tool")
    print("=" * 60)
    print(f"\nInput: {filename}")
    print(f"Output: {os.path.basename(output_file)}")
    print("-" * 60)
    
    if optimize_with_moviepy(input_file, output_file):
        print(f"\nOptimized video saved to: {output_file}")
        print("\nNow updating script.js with video path...")
        return output_file
    else:
        print("\nFailed to optimize video.")
        print("\nAlternative: Use online tools like:")
        print("  - https://www.freeconvert.com/video-compressor")
        print("  - https://www.media.io/video-compressor.html")
        return None

if __name__ == "__main__":
    main()
