#!/usr/bin/env bash
# =============================================================================
#  Kết xuất toàn bộ biểu đồ .puml trong docs/diagrams thành ảnh PNG
#  Yêu cầu: Java 17+ và file plantuml.jar (tải tại https://plantuml.com/download)
#
#  Cách dùng:
#     cd docs/diagrams
#     ./render.sh                 # tìm plantuml.jar ở thư mục hiện tại hoặc trong PATH
#     ./render.sh /duong/dan/plantuml.jar
# =============================================================================
set -euo pipefail

cd "$(dirname "$0")"

JAR="${1:-}"
if [[ -z "$JAR" ]]; then
  if [[ -f "plantuml.jar" ]]; then
    JAR="plantuml.jar"
  elif command -v plantuml >/dev/null 2>&1; then
    echo "==> Dùng PlantUML từ PATH"
    RENDER=(plantuml)
  else
    echo "❌ Không tìm thấy plantuml.jar."
    echo "   Tải tại: https://plantuml.com/download  hoặc chạy: ./render.sh /duong/dan/plantuml.jar"
    exit 1
  fi
fi

if [[ -z "${RENDER[*]:-}" ]]; then
  command -v java >/dev/null 2>&1 || { echo "❌ Chưa cài Java (cần JDK 17+)"; exit 1; }
  RENDER=(java -jar "$JAR")
fi

echo "==> Kết xuất biểu đồ ca sử dụng..."
"${RENDER[@]}" -tpng -charset UTF-8 "use-case/*.puml"

echo "==> Kết xuất biểu đồ tuần tự..."
"${RENDER[@]}" -tpng -charset UTF-8 "sequence/*.puml"

echo "✅ Hoàn tất. Ảnh PNG đã được ghi cạnh từng file .puml"
