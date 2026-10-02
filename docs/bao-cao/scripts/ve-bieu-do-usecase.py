#!/usr/bin/env python3
"""Vẽ bốn biểu đồ Use Case từ nguồn UML có thể chỉnh sửa."""
import sys
from render_uml import main

if __name__ == "__main__":
    main(["--group", "usecase", *sys.argv[1:]])
