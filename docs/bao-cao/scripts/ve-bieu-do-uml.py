#!/usr/bin/env python3
"""Vẽ biểu đồ lớp, tuần tự, hoạt động, thành phần và triển khai."""
import sys
from render_uml import main

if __name__ == "__main__":
    main(["--group", "other", *sys.argv[1:]])
