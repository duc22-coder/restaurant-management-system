# -*- coding: utf-8 -*-
"""Sinh biểu đồ usecase (kiểu UML cổ điển) cho báo cáo - matplotlib."""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Ellipse, Rectangle, FancyArrowPatch, Circle
from matplotlib.lines import Line2D

OUT = "/home/user/restaurant-management-system/docs/bao-cao/images"

EDGE_UC = "#1d4ed8"
EDGE_ACT = "#0f172a"
C_ASSOC = "#64748b"
C_INCL = "#15803d"
C_EXT = "#c2410c"


def draw_actor(ax, x, y, label, side="left", scale=1.0):
    h = 0.085 * scale
    r = 0.016 * scale
    ax.add_patch(Circle((x, y + h * 0.62), r, fill=True, facecolor="white",
                        edgecolor=EDGE_ACT, lw=1.6, zorder=6))
    ax.add_line(Line2D([x, x], [y + h * 0.62 - r, y - h * 0.28], color=EDGE_ACT, lw=1.6, zorder=6))
    ax.add_line(Line2D([x - h * 0.32, x + h * 0.32], [y + h * 0.18, y + h * 0.18], color=EDGE_ACT, lw=1.6, zorder=6))
    ax.add_line(Line2D([x, x - h * 0.28], [y - h * 0.28, y - h * 0.62], color=EDGE_ACT, lw=1.6, zorder=6))
    ax.add_line(Line2D([x, x + h * 0.28], [y - h * 0.28, y - h * 0.62], color=EDGE_ACT, lw=1.6, zorder=6))
    if side == "left":
        ax.text(x - h * 0.42, y, label, ha="right", va="center", fontsize=10.5,
                fontweight="bold", color=EDGE_ACT, zorder=6)
    else:
        ax.text(x + h * 0.42, y, label, ha="left", va="center", fontsize=10.5,
                fontweight="bold", color=EDGE_ACT, zorder=6)


def draw_uc(ax, x, y, label, rx=0.088, ry=0.034, fs=8.6):
    ax.add_patch(Ellipse((x, y), rx * 2, ry * 2, facecolor="white",
                         edgecolor=EDGE_UC, lw=1.5, zorder=5))
    ax.text(x, y, label, ha="center", va="center", fontsize=fs,
            color="#0f172a", zorder=6, linespacing=1.15)


def assoc(ax, p_actor, p_uc):
    ax.add_line(Line2D([p_actor[0], p_uc[0]], [p_actor[1], p_uc[1]],
                       color=C_ASSOC, lw=1.15, zorder=2))


def dep(ax, p_from, p_to, label, style="include", rad=0.0, lab_pos=None):
    color = C_INCL if style == "include" else C_EXT
    arrow = FancyArrowPatch(p_from, p_to, arrowstyle="-|>", mutation_scale=11,
                            linewidth=1.1, linestyle=(0, (4, 2.6)), color=color,
                            connectionstyle=f"arc3,rad={rad}",
                            shrinkA=2, shrinkB=2, zorder=3)
    ax.add_patch(arrow)
    if lab_pos is not None:
        mx, my = lab_pos
    elif rad == 0:
        mx, my = (p_from[0] + p_to[0]) / 2, (p_from[1] + p_to[1]) / 2
    else:
        mx = (p_from[0] + p_to[0]) / 2 + rad * (p_to[1] - p_from[1]) / 2
        my = (p_from[1] + p_to[1]) / 2 - rad * (p_to[0] - p_from[0]) / 2
    if label:
        ax.text(mx, my + 0.012, label, ha="center", va="bottom", fontsize=7.2,
                style="italic", color=color, zorder=4)


def legend_uc(ax, x, y):
    handles = [
        Line2D([0], [0], color=C_ASSOC, lw=1.2, label="Liên kết (association)"),
        Line2D([0], [0], color=C_INCL, lw=1.2, linestyle=(0, (4, 2.6)), label="«include»"),
        Line2D([0], [0], color=C_EXT, lw=1.2, linestyle=(0, (4, 2.6)), label="«extend»"),
    ]
    leg = ax.legend(handles=handles, loc="lower left", bbox_to_anchor=(x, y),
                    fontsize=7.6, frameon=True, ncol=3, borderpad=0.5)
    leg.get_frame().set_edgecolor("#cbd5e1")


def new_ax(figsize):
    fig, ax = plt.subplots(figsize=figsize)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")
    return fig, ax


def boundary(ax, x0, y0, x1, y1, title):
    ax.add_patch(Rectangle((x0, y0), x1 - x0, y1 - y0, facecolor="#f8fafc",
                           edgecolor="#334155", lw=1.4, zorder=1))
    ax.text((x0 + x1) / 2, y1 - 0.018, title, ha="center", va="top",
            fontsize=11, fontweight="bold", color="#0f172a", zorder=4)


def save(fig, name):
    fig.savefig(f"{OUT}/{name}", dpi=170, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print("saved", name)


# ============================================================================
# 1. Biểu đồ usecase TỔNG QUÁT toàn hệ thống
# ============================================================================
fig, ax = new_ax((15.5, 12.5))
boundary(ax, 0.175, 0.04, 0.825, 0.935, "HỆ THỐNG QUẢN LÝ & ĐẶT MÓN NHÀ HÀNG")

kh = (0.070, 0.58)
bank = (0.070, 0.115)
nv = (0.925, 0.72)
qt = (0.925, 0.28)
draw_actor(ax, *kh, "Khách hàng", side="left")
draw_actor(ax, *bank, "Hệ thống ngân hàng\n(dịch vụ VietQR)", side="left")
draw_actor(ax, *nv, "Nhân viên\nphục vụ", side="right")
draw_actor(ax, *qt, "Quản trị viên", side="right")

rx, ry = 0.086, 0.032
cust = [
    (0.285, 0.855, "Xem thực đơn,\ntìm kiếm & lọc danh mục"),
    (0.285, 0.738, "Quản lý giỏ hàng"),
    (0.285, 0.621, "Đặt món\n(đa hình thức)"),
    (0.285, 0.504, "Theo dõi tiến độ\nđơn món"),
    (0.285, 0.387, "Gửi yêu cầu\ntính tiền"),
    (0.285, 0.270, "Thanh toán qua\nmã VietQR"),
    (0.285, 0.153, "Xem lịch sử\nđơn hàng"),
]
shared_login = (0.505, 0.855, "Đăng nhập hệ thống")
shared_reg = (0.505, 0.738, "Đăng ký tài khoản")
staff = [
    (0.715, 0.855, "Quản lý đơn món &\nquy trình bếp"),
    (0.715, 0.738, "Quản lý trạng thái\nbàn ăn"),
    (0.715, 0.621, "Xử lý thanh toán"),
]
admin = [
    (0.715, 0.520, "Quản lý danh mục\n& món ăn"),
    (0.715, 0.435, "Quản lý bàn ăn"),
    (0.715, 0.350, "Quản lý người dùng"),
    (0.715, 0.265, "Quản lý khuyến mãi"),
    (0.715, 0.180, "Quản lý đơn hàng"),
    (0.715, 0.095, "Thống kê & báo cáo"),
]
for x, y, lab in cust + [shared_login, shared_reg] + staff + admin:
    draw_uc(ax, x, y, lab, rx=rx, ry=ry)

for x, y, _ in cust:
    assoc(ax, (kh[0] + 0.028, kh[1]), (x, y))
# Đăng nhập: cả 3 actor; Đăng ký: chỉ Khách hàng
assoc(ax, (kh[0] + 0.028, kh[1]), (shared_reg[0], shared_reg[1]))
for p_actor in [(kh[0] + 0.028, kh[1]), (nv[0] - 0.028, nv[1]), (qt[0] - 0.028, qt[1])]:
    assoc(ax, p_actor, (shared_login[0], shared_login[1]))
for x, y, _ in staff:
    assoc(ax, (nv[0] - 0.028, nv[1]), (x, y))
for x, y, _ in admin:
    assoc(ax, (qt[0] - 0.028, qt[1]), (x, y))
assoc(ax, (bank[0] + 0.028, bank[1]), (0.285, 0.270))

legend_uc(ax, 0.02, -0.015)
ax.text(0.5, 1.0, "Hình 2.1 – Biểu đồ usecase tổng quát của hệ thống",
        ha="center", va="bottom", fontsize=11.5, fontweight="bold", color="#0f172a")
save(fig, "usecase-tong-quat.png")

# ============================================================================
# 2. Biểu đồ usecase phân hệ KHÁCH HÀNG
# ============================================================================
fig, ax = new_ax((15, 11.5))
boundary(ax, 0.20, 0.04, 0.80, 0.945, "PHÂN HỆ KHÁCH HÀNG")

khs = (0.075, 0.55)
banks = (0.075, 0.085)
draw_actor(ax, *khs, "Khách hàng", side="left")
draw_actor(ax, *banks, "Hệ thống ngân hàng\n(dịch vụ VietQR)", side="left")

col1 = [
    (0.335, 0.845, "Đăng ký tài khoản"),
    (0.335, 0.732, "Đăng nhập / Đăng xuất"),
    (0.335, 0.619, "Xem & cập nhật\nhồ sơ cá nhân"),
    (0.335, 0.506, "Xem thực đơn"),
    (0.335, 0.393, "Quản lý giỏ hàng"),
    (0.335, 0.280, "Xem lịch sử\nđơn hàng"),
]
col2 = [
    (0.665, 0.845, "Đặt món ăn\ntại bàn"),
    (0.665, 0.715, "Nhận diện bàn ăn\nqua mã QR"),
    (0.665, 0.585, "Đặt món mang về"),
    (0.665, 0.455, "Đặt món\ngiao tận nơi"),
    (0.665, 0.325, "Theo dõi tiến độ\nđơn món"),
    (0.665, 0.195, "Gửi yêu cầu\ntính tiền"),
    (0.665, 0.085, "Xem mã QR\nthanh toán"),
]
mid = (0.500, 0.506, "Tìm kiếm & lọc\ndanh mục", 0.062)
for x, y, lab in col1 + col2:
    draw_uc(ax, x, y, lab, rx=0.095, ry=0.036)
    assoc(ax, (khs[0] + 0.028, khs[1]), (x, y))
draw_uc(ax, mid[0], mid[1], mid[2], rx=mid[3], ry=0.036)
assoc(ax, (khs[0] + 0.028, khs[1]), (mid[0], mid[1]))
assoc(ax, (banks[0] + 0.028, banks[1]), (0.665, 0.085))

# Đặt món ăn tại bàn «include» Nhận diện bàn ăn qua mã QR
dep(ax, (0.665, 0.809), (0.665, 0.751), "«include» Xác định bàn ăn", style="include",
    lab_pos=(0.665, 0.755))
# Gửi yêu cầu tính tiền «include» Xem mã QR thanh toán
dep(ax, (0.665, 0.159), (0.665, 0.121), "«include»", style="include", lab_pos=(0.665, 0.126))
# Tìm kiếm & lọc danh mục «extend» Xem thực đơn
dep(ax, (0.438, 0.506), (0.427, 0.506), "«extend»", style="extend", lab_pos=(0.485, 0.532))

legend_uc(ax, 0.02, -0.015)
ax.text(0.5, 1.0, "Hình 2.2 – Biểu đồ usecase phân hệ Khách hàng",
        ha="center", va="bottom", fontsize=11.5, fontweight="bold", color="#0f172a")
save(fig, "usecase-khach-hang.png")

# ============================================================================
# 3. Biểu đồ usecase phân hệ NHÂN VIÊN PHỤC VỤ
# ============================================================================
fig, ax = new_ax((15, 11))
boundary(ax, 0.22, 0.04, 0.82, 0.945, "PHÂN HỆ NHÂN VIÊN PHỤC VỤ")

nvs = (0.08, 0.52)
banks = (0.08, 0.10)
draw_actor(ax, *nvs, "Nhân viên\nphục vụ", side="left")
draw_actor(ax, *banks, "Hệ thống ngân hàng\n(dịch vụ VietQR)", side="left")

col1 = [
    (0.385, 0.845, "Đăng nhập / Đăng xuất"),
    (0.385, 0.710, "Xem danh sách đơn\nhàng đang xử lý"),
    (0.385, 0.575, "Cập nhật trạng thái\nđơn hàng"),
    (0.385, 0.440, "Cập nhật trạng thái\ntừng món ăn (bếp)"),
    (0.385, 0.305, "Quản lý trạng thái\nbàn ăn"),
    (0.385, 0.170, "Xem trước hóa đơn"),
]
col2 = [
    (0.705, 0.710, "Xử lý thanh toán"),
    (0.705, 0.520, "Xác thực mã\ngiảm giá"),
    (0.705, 0.330, "Xác nhận thanh toán\n& giải phóng bàn"),
    (0.705, 0.135, "Sinh mã QR\nchuyển khoản"),
]
for x, y, lab in col1 + col2:
    draw_uc(ax, x, y, lab, rx=0.112, ry=0.039)
    assoc(ax, (nvs[0] + 0.028, nvs[1]), (x, y))
assoc(ax, (banks[0] + 0.028, banks[1]), (0.705, 0.135))

# Xử lý thanh toán «include» Xác thực mã giảm giá
dep(ax, (0.705, 0.671), (0.705, 0.559), "«include»", style="include")
# Xử lý thanh toán «include» Xác nhận thanh toán & giải phóng bàn (vòng cung trái)
dep(ax, (0.615, 0.70), (0.615, 0.355), "«include»", style="include", rad=0.30,
    lab_pos=(0.545, 0.52))
# Xử lý thanh toán «include» Xem trước hóa đơn
dep(ax, (0.598, 0.70), (0.492, 0.185), "«include»", style="include", rad=0.12,
    lab_pos=(0.525, 0.41))
# Sinh mã QR «extend» Xử lý thanh toán (vòng cung phải)
dep(ax, (0.79, 0.160), (0.79, 0.695), "«extend»\n(chuyển khoản)", style="extend", rad=-0.32,
    lab_pos=(0.775, 0.40))

legend_uc(ax, 0.02, -0.015)
ax.text(0.5, 1.0, "Hình 2.3 – Biểu đồ usecase phân hệ Nhân viên phục vụ",
        ha="center", va="bottom", fontsize=11.5, fontweight="bold", color="#0f172a")
save(fig, "usecase-nhan-vien.png")

# ============================================================================
# 4. Biểu đồ usecase phân hệ QUẢN TRỊ VIÊN
# ============================================================================
fig, ax = new_ax((15, 11))
boundary(ax, 0.22, 0.04, 0.82, 0.945, "PHÂN HỆ QUẢN TRỊ VIÊN")

qts = (0.08, 0.52)
draw_actor(ax, *qts, "Quản trị viên", side="left")

col1 = [
    (0.40, 0.845, "Đăng nhập / Đăng xuất"),
    (0.40, 0.695, "Quản lý danh mục\nmón ăn"),
    (0.40, 0.545, "Quản lý món ăn"),
    (0.40, 0.395, "Quản lý bàn ăn"),
    (0.40, 0.245, "Quản lý người dùng"),
]
col2 = [
    (0.72, 0.845, "Quản lý khuyến mãi\n(voucher)"),
    (0.72, 0.680, "Quản lý đơn hàng"),
    (0.72, 0.515, "Xem thống kê &\nbáo cáo doanh thu"),
    (0.72, 0.310, "Khóa / mở tài khoản"),
]
for x, y, lab in col1 + col2:
    draw_uc(ax, x, y, lab, rx=0.118, ry=0.040)
    assoc(ax, (qts[0] + 0.028, qts[1]), (x, y))

# Khóa / mở tài khoản «extend» Quản lý người dùng
dep(ax, (0.615, 0.305), (0.515, 0.252), "«extend»", style="extend", lab_pos=(0.575, 0.315))

legend_uc(ax, 0.02, -0.015)
ax.text(0.5, 1.0, "Hình 2.4 – Biểu đồ usecase phân hệ Quản trị viên",
        ha="center", va="bottom", fontsize=11.5, fontweight="bold", color="#0f172a")
save(fig, "usecase-quan-tri.png")
