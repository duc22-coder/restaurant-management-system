#!/usr/bin/env python3
"""Render các nguồn PlantUML của báo cáo; tuyệt đối không lưu ảnh báo lỗi.

Cần Java + PLANTUML_JAR, lệnh plantuml, hoặc gói plantuml-local-client.
Graphviz (dot) dùng để bố trí các biểu đồ cấu trúc; không gửi nội dung lên dịch vụ online.
"""
from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor
import importlib.util
import os
from pathlib import Path
import shutil
import struct
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / "uml"
IMAGES = ROOT / "images"
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


def engine_command() -> list[str]:
    jar_env = os.environ.get("PLANTUML_JAR")
    jar = Path(jar_env).expanduser().resolve() if jar_env else None
    if jar and not jar.is_file():
        raise RuntimeError(f"Không tìm thấy PLANTUML_JAR: {jar}")
    if jar is None:
        spec = importlib.util.find_spec("plantuml_local_client")
        if spec and spec.origin:
            jar = next(Path(spec.origin).parent.glob("plantuml*.jar"), None)

    if jar:
        java = shutil.which("java")
        if java is None and os.environ.get("JAVA_HOME"):
            java = str(Path(os.environ["JAVA_HOME"]) / "bin" / "java")
        if java is None and importlib.util.find_spec("jdk4py"):
            import jdk4py
            java = str(jdk4py.JAVA_HOME / "bin" / "java")
        if not java or not Path(java).is_file():
            raise RuntimeError("Cần Java trên PATH hoặc JAVA_HOME (có thể dùng jdk4py).")
        return [java, "-Xmx384m", "-Djava.awt.headless=true", "-jar", str(jar)]

    client = shutil.which("plantuml")
    if client:
        return [client]
    raise RuntimeError("Cần lệnh plantuml hoặc PLANTUML_JAR; xem docs/bao-cao/README.md.")


def render_one(source: Path, command: list[str], check: bool) -> str:
    if check:
        args = ["-charset", "UTF-8", "-checkonly", str(source)]
        result = subprocess.run(command + args, cwd=SOURCES, capture_output=True, timeout=90)
    else:
        args = ["-charset", "UTF-8", "-tpng", "-pipe"]
        result = subprocess.run(command + args, input=source.read_bytes(), cwd=SOURCES,
                                capture_output=True, timeout=90)
    if result.returncode:
        detail = result.stderr.decode("utf-8", errors="replace").strip()
        raise RuntimeError(f"PlantUML lỗi ở {source.name}: {detail}")
    if check:
        return f"OK cú pháp: {source.name}"

    image = result.stdout
    if len(image) < 24 or not image.startswith(PNG_SIGNATURE):
        raise RuntimeError(f"PlantUML không trả về PNG hợp lệ: {source.name}")
    width, height = struct.unpack(">II", image[16:24])
    if not (100 <= width <= 8000 and 100 <= height <= 8000):
        raise RuntimeError(f"Kích thước PNG bất thường: {source.name}: {width} × {height}")
    IMAGES.mkdir(parents=True, exist_ok=True)
    destination = IMAGES / f"{source.stem}.png"
    with tempfile.NamedTemporaryFile(dir=IMAGES, suffix=".png", delete=False) as temporary:
        temporary.write(image)
        temporary_name = temporary.name
    os.replace(temporary_name, destination)
    return f"Đã vẽ: {destination.name} ({width} × {height})"


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--group", choices=("all", "usecase", "other"), default="all")
    parser.add_argument("--check", action="store_true", help="chỉ kiểm tra cú pháp, không sửa ảnh")
    args = parser.parse_args(argv)
    sources = sorted(p for p in SOURCES.glob("*.puml") if not p.name.startswith("_"))
    if args.group != "all":
        usecase = args.group == "usecase"
        sources = [p for p in sources if p.stem.startswith("usecase-") == usecase]
    if not sources:
        parser.error("Không tìm thấy nguồn biểu đồ.")
    try:
        command = engine_command()
        with ThreadPoolExecutor(max_workers=3) as executor:
            results = executor.map(lambda p: render_one(p, command, args.check), sources)
            for result in results:
                print(result)
    except (RuntimeError, subprocess.TimeoutExpired) as error:
        parser.exit(1, f"{error}\n")


if __name__ == "__main__":
    main()
