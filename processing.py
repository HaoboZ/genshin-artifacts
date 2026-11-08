"""Python replacement for the processing package.

Usage:
  python processing.py image <path>
  python processing.py video <path>
  python processing.py video -s <path>   # probe durations only

Requires Pillow for image processing. FFmpeg/ffprobe are used from PATH when
available, otherwise the Windows build is downloaded to output/ffmpeg.
"""

import json
from pathlib import Path, PurePosixPath
import re
import shutil
import subprocess
import sys
import urllib.request
import zipfile

from PIL import Image, UnidentifiedImageError

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".tiff", ".avif"}
VIDEO_EXTENSIONS = {".mp4"}
FFMPEG_URL = (
    "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/"
    "ffmpeg-master-latest-win64-gpl.zip"
)
USAGE = """Usage: processing.py <action> [options] <path>
\tprocessing.py image <path>       Run image processing
\tprocessing.py video <path>       Run video processing
\tprocessing.py video -s <path>    Run ffprobe only (no output)
"""


def get_ffmpeg_paths() -> tuple[str, str]:
    ffmpeg, ffprobe = shutil.which("ffmpeg"), shutil.which("ffprobe")
    if ffmpeg and ffprobe:
        return ffmpeg, ffprobe

    ffmpeg_dir = Path.cwd() / "output" / "ffmpeg"
    local_ffmpeg, local_ffprobe = ffmpeg_dir / "ffmpeg.exe", ffmpeg_dir / "ffprobe.exe"
    if local_ffmpeg.is_file() and local_ffprobe.is_file():
        return str(local_ffmpeg), str(local_ffprobe)

    ffmpeg_dir.mkdir(parents=True, exist_ok=True)
    archive_path = ffmpeg_dir / "ffmpeg.zip"
    print(f"FFmpeg not found. Downloading to {ffmpeg_dir}...")
    try:
        urllib.request.urlretrieve(FFMPEG_URL, archive_path)
        with zipfile.ZipFile(archive_path) as archive:
            executables = {}
            for member in archive.infolist():
                parts = PurePosixPath(member.filename).parts
                if len(parts) >= 3 and parts[-2] == "bin" and parts[-1] in {"ffmpeg.exe", "ffprobe.exe"}:
                    executables[parts[-1]] = member
            if set(executables) != {"ffmpeg.exe", "ffprobe.exe"}:
                raise RuntimeError("Downloaded archive is missing ffmpeg.exe or ffprobe.exe")
            for name, member in executables.items():
                with archive.open(member) as source, (ffmpeg_dir / name).open("wb") as target:
                    shutil.copyfileobj(source, target)
    except Exception:
        local_ffmpeg.unlink(missing_ok=True)
        local_ffprobe.unlink(missing_ok=True)
        raise
    finally:
        archive_path.unlink(missing_ok=True)
    print(f"FFmpeg ready at {ffmpeg_dir}")
    return str(local_ffmpeg), str(local_ffprobe)


def process_path(input_path: str, extensions: set[str]) -> list[Path] | None:
    path = Path(input_path.strip().strip("\"'").strip())
    if not path.exists():
        print(f"Error: {input_path} is not a valid file or directory.", file=sys.stderr)
        return None
    if path.is_file():
        if path.suffix.lower() not in extensions:
            supported = ", ".join(sorted(extensions))
            print(f"Error: {input_path} is not a supported file ({supported}).", file=sys.stderr)
            return None
        return [path]
    if path.is_dir():
        files = sorted(p for p in path.rglob("*") if p.is_file() and p.suffix.lower() in extensions)
        if not files:
            print(f"No supported files found in {input_path}")
        return files
    print(f"Error: {input_path} is not a valid file or directory.", file=sys.stderr)
    return None


def probe_video(input_file: Path, ffprobe: str) -> float | None:
    result = subprocess.run(
        [ffprobe, "-v", "quiet", "-print_format", "json", "-show_format", str(input_file)],
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode:
        print(f"Error probing with ffprobe: {input_file} (exit {result.returncode})")
        return None
    try:
        duration = json.loads(result.stdout).get("format", {}).get("duration")
        return float(duration) if duration is not None else None
    except (ValueError, TypeError, json.JSONDecodeError):
        print(f"Error parsing ffprobe output: {input_file}")
        return None


def process_image(input_file: Path) -> None:
    output_file = Path.cwd() / "output" / "image" / input_file.name
    print(f"Cropping image: {input_file}")
    try:
        with Image.open(input_file) as image:
            width, height = image.size
            crop_size = min(width, height, 900)
            left, top = (width - crop_size) // 2, (height - crop_size) // 2
            image.crop((left, top, left + crop_size, top + crop_size)).save(output_file)
        print(f"\tDone: {output_file}")
    except (UnidentifiedImageError, OSError) as error:
        print(f"\tError processing {input_file}: {error}")


def process_video(input_file: Path, ffmpeg: str, ffprobe: str) -> None:
    output_file = Path.cwd() / "output" / "video" / input_file.name
    output_file.parent.mkdir(parents=True, exist_ok=True)
    duration = probe_video(input_file, ffprobe)
    length = f"{duration:.1f}s" if duration is not None else "?s"
    print(f"Converting video: {input_file} ({length})")
    command = [
        ffmpeg, "-i", str(input_file), "-vf", "scale=-2:720",
        "-c:v", "libx265", "-crf", "24", "-pix_fmt", "yuv420p",
        "-tag:v", "hvc1", "-movflags", "+faststart",
        "-c:a", "aac", "-b:a", "128k", "-y", str(output_file),
    ]
    try:
        process = subprocess.Popen(command, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True)
        assert process.stderr is not None
        for line in process.stderr:
            time_match = re.search(r"time=(\d{2}:\d{2}:\d{2}\.\d{2})", line)
            if not time_match:
                continue
            fps = re.search(r"fps=\s*(\d+)", line)
            size = re.search(r"size=\s*(\d+)KiB", line)
            hours, minutes, seconds = (float(value) for value in time_match.group(1).split(":"))
            current_time = hours * 3600 + minutes * 60 + seconds
            percent = f"{current_time / duration * 100:.1f}%" if duration and duration > 0 else "?%"
            print(f"\r\t{time_match.group(1)} | {percent} | {fps.group(1) if fps else '?'} fps | {size.group(1) if size else '?'} KiB", end="", flush=True)
        code = process.wait()
        print()
        if code == 0:
            print(f"\tDone: {output_file}")
        else:
            output_file.unlink(missing_ok=True)
            print(f"Error converting {input_file} (ffmpeg exit {code})")
    except OSError as error:
        output_file.unlink(missing_ok=True)
        print(f"Error spawning ffmpeg: {error}")


def main(arguments: list[str]) -> int:
    if not arguments or len(arguments) < 2:
        print(USAGE, end="")
        return 1

    action, *rest = arguments
    if action == "image":
        files = process_path(" ".join(rest), IMAGE_EXTENSIONS)
        if files is None:
            return 1
        (Path.cwd() / "output" / "image").mkdir(parents=True, exist_ok=True)
        for file in files:
            process_image(file)
        return 0

    if action == "video":
        probe_only = rest[0] == "-s"
        input_parts = rest[1:] if probe_only else rest
        if not input_parts:
            print(USAGE, end="")
            return 1
        files = process_path(" ".join(input_parts), VIDEO_EXTENSIONS)
        if files is None:
            return 1
        if not files:
            return 0
        ffmpeg, ffprobe = get_ffmpeg_paths()
        if probe_only:
            for file in files:
                duration = probe_video(file, ffprobe)
                print(f"{file}: {duration:.1f}s" if duration is not None else f"{file}: ?s")
        else:
            (Path.cwd() / "output" / "video").mkdir(parents=True, exist_ok=True)
            for file in files:
                process_video(file, ffmpeg, ffprobe)
        return 0

    print(USAGE, end="")
    return 1


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv[1:]))
    except Exception as error:
        print(f"Error: {error}", file=sys.stderr)
        raise SystemExit(1)
