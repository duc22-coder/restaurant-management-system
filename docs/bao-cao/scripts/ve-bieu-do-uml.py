# -*- coding: utf-8 -*-
"""Sinh các biểu đồ UML (lớp, tuần tự, hành động, thành phần, triển khai) cho báo cáo."""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import (Ellipse, Rectangle, FancyArrowPatch, Circle,
                                Polygon, FancyBboxPatch)
from matplotlib.lines import Line2D

OUT = "/home/user/restaurant-management-system/docs/bao-cao/images"

EDGE = "#1d4ed8"
DARK = "#0f172a"
C_ARR = "#475569"
C_DEP = "#15803d"
C_EXT = "#c2410c"
HDR_FILL = "#dbeafe"
BOX_FILL = "#ffffff"
PKG_FILL = "#f8fafc"
NOTE_FILL = "#fef9c3"


def new_ax(figsize, title):
    fig, ax = plt.subplots(figsize=figsize)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")
    ax.text(0.5, 1.0, title, ha="center", va="bottom", fontsize=11.5,
            fontweight="bold", color=DARK)
    return fig, ax


def save(fig, name):
    fig.savefig(f"{OUT}/{name}", dpi=170, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print("saved", name)


# ---------------------------------------------------------------- helpers ---
class Rect:
    def __init__(self, x0, y0, x1, y1):
        self.x0, self.y0, self.x1, self.y1 = x0, y0, x1, y1

    @property
    def cx(self): return (self.x0 + self.x1) / 2

    @property
    def cy(self): return (self.y0 + self.y1) / 2

    def edge(self, toward):
        """Điểm trên viền hình chữ nhật về phía điểm toward=(x,y)."""
        tx, ty = toward
        dx, dy = tx - self.cx, ty - self.cy
        if dx == 0 and dy == 0:
            return (self.cx, self.y1)
        candidates = []
        if dx != 0:
            for x in (self.x0, self.x1):
                t = (x - self.cx) / dx
                y = self.cy + t * dy
                if self.y0 - 1e-9 <= y <= self.y1 + 1e-9 and t > 0:
                    candidates.append((x, y))
        if dy != 0:
            for y in (self.y0, self.y1):
                t = (y - self.cy) / dy
                x = self.cx + t * dx
                if self.x0 - 1e-9 <= x <= self.x1 + 1e-9 and t > 0:
                    candidates.append((x, y))
        if not candidates:
            return (self.cx, self.y1)
        return min(candidates, key=lambda p: (p[0] - self.cx) ** 2 + (p[1] - self.cy) ** 2)


def draw_class(ax, xc, ytop, name, attrs=(), methods=(), stereo=None,
               w=0.21, fs=7.7, tfs=8.8, fill=BOX_FILL):
    line_h = 0.0175
    hdr = 0.030 + (0.020 if stereo else 0) + (0.022 if "\n" in name else 0)
    a_h = max(len(attrs) * line_h + 0.014, 0.026)
    m_h = max(len(methods) * line_h + 0.014, 0.026) if methods else 0.022
    h = hdr + a_h + m_h
    x0, y0 = xc - w / 2, ytop - h
    r = Rect(x0, y0, xc + w / 2, ytop)
    ax.add_patch(Rectangle((x0, y0), w, h, facecolor=fill, edgecolor=EDGE,
                           lw=1.25, zorder=5))
    y = ytop - 0.012
    if stereo:
        ax.text(xc, y, f"«{stereo}»", ha="center", va="top", fontsize=fs - 0.8,
                style="italic", color=DARK, zorder=6)
        y -= 0.020
    ax.text(xc, y, name, ha="center", va="top", fontsize=tfs, fontweight="bold",
            color=DARK, zorder=6, linespacing=1.1)
    y -= 0.022 * (name.count("\n") + 1)
    ax.add_line(Line2D([x0, x0 + w], [ytop - hdr, ytop - hdr], color=EDGE, lw=1.0, zorder=6))
    yy = ytop - hdr - 0.010
    for a in attrs:
        ax.text(x0 + 0.008, yy, a, ha="left", va="top", fontsize=fs,
                color=DARK, zorder=6)
        yy -= line_h
    if methods:
        ax.add_line(Line2D([x0, x0 + w], [y0 + m_h, y0 + m_h], color=EDGE, lw=1.0, zorder=6))
        yy = y0 + m_h - 0.010
        for m in methods:
            ax.text(x0 + 0.008, yy, m, ha="left", va="top", fontsize=fs,
                    color=DARK, zorder=6)
            yy -= line_h
    return r


def draw_pkg(ax, x0, ytop, w, h, title, lines, fs=7.8):
    """Hộp package kiểu UML (có tab)."""
    ax.add_patch(Rectangle((x0, ytop - h), w, h, facecolor=PKG_FILL,
                           edgecolor="#334155", lw=1.25, zorder=5))
    tab_w, tab_h = w * 0.42, 0.030
    ax.add_patch(Rectangle((x0, ytop), tab_w, tab_h, facecolor=PKG_FILL,
                           edgecolor="#334155", lw=1.25, zorder=5))
    ax.add_line(Line2D([x0, x0 + w], [ytop, ytop], color="#334155", lw=1.25, zorder=6))
    ax.text(x0 + tab_w / 2, ytop + tab_h / 2, title, ha="center", va="center",
            fontsize=8.4, fontweight="bold", color=DARK, zorder=6)
    yy = ytop - 0.028
    for ln in lines:
        ax.text(x0 + 0.012, yy, ln, ha="left", va="top", fontsize=fs, color=DARK,
                zorder=6, family="monospace")
        yy -= 0.026
    return Rect(x0, ytop - h, x0 + w, ytop)


def draw_note(ax, xc, ytop, w, lines, fs=7.6):
    line_h = 0.017
    h = len(lines) * line_h + 0.02
    x0, y0 = xc - w / 2, ytop - h
    fold = 0.014
    pts = [(x0, y0), (x0, ytop), (x0 + w - fold, ytop), (x0 + w, ytop - fold),
           (x0 + w, y0)]
    ax.add_patch(Polygon(pts, closed=True, facecolor=NOTE_FILL, edgecolor="#a16207",
                         lw=1.0, zorder=5))
    ax.add_line(Line2D([x0 + w - fold, x0 + w - fold, x0 + w],
                       [ytop, ytop - fold, ytop - fold], color="#a16207", lw=1.0, zorder=6))
    yy = ytop - 0.016
    for ln in lines:
        ax.text(xc, yy, ln, ha="center", va="top", fontsize=fs, color="#713f12",
                zorder=6)
        yy -= line_h
    return Rect(x0, y0, x0 + w, ytop)


def arrow(ax, p_from, p_to, style="assoc", label="", lab_dx=0, lab_dy=0.010,
          color=None, lw=1.15, zorder=3):
    color = color or (C_DEP if style in ("dep", "impl") else C_ARR)
    if style == "inherit":
        arrowstyle = "-|>|open,halfopen"  # fallback below
        arrowstyle = "-|>"
    elif style in ("dep", "impl"):
        arrowstyle = "-|>"
    else:
        arrowstyle = "-|>"
    ls = (0, (4, 2.6)) if style in ("dep", "impl") else "solid"
    patch = FancyArrowPatch(p_from, p_to, arrowstyle=arrowstyle, mutation_scale=12,
                            linewidth=lw, linestyle=ls, color=color,
                            shrinkA=1, shrinkB=1, zorder=zorder)
    ax.add_patch(patch)
    if style == "inherit":
        # mũi tên rỗng (tam giác) ở đầu đích
        (fx, fy), (tx, ty) = p_from, p_to
        ang = plt.math.atan2(ty - fy, tx - fx) if hasattr(plt, "math") else __import__("math").atan2(ty - fy, tx - fx)
        import math
        ang = math.atan2(ty - fy, tx - fx)
        size = 0.018
        p1 = (tx, ty)
        p2 = (tx - size * math.cos(ang - 0.45), ty - size * math.sin(ang - 0.45))
        p3 = (tx - size * math.cos(ang + 0.45), ty - size * math.sin(ang + 0.45))
        ax.add_patch(Polygon([p1, p2, p3], closed=True, facecolor="white",
                             edgecolor=color, lw=1.1, zorder=zorder + 1))
    if label:
        mx, my = (p_from[0] + p_to[0]) / 2 + lab_dx, (p_from[1] + p_to[1]) / 2 + lab_dy
        ax.text(mx, my, label, ha="center", va="bottom", fontsize=7.2,
                style="italic", color=color, zorder=zorder + 2)


def mult(ax, pos, text, dx=0.006, dy=0.006, ha="left", va="bottom"):
    ax.text(pos[0] + dx, pos[1] + dy, text, ha=ha, va=va, fontsize=7.2,
            color=DARK, zorder=7)


# ============================================================ 1. CLASS TỔNG QUAN
fig, ax = new_ax((15, 10), "Hình 2.5 – Biểu đồ lớp tổng quan theo kiến trúc phân tầng")

p1 = draw_pkg(ax, 0.025, 0.885, 0.215, 0.30, "Lớp Controller (REST API)",
              ["AuthController", "CustomerMenuController",
               "CustomerOrderController", "CustomerPaymentController",
               "StaffOrderController", "StaffPaymentController",
               "AdminOrderController", "... (17 controller)"])
p2 = draw_pkg(ax, 0.285, 0.885, 0.215, 0.30, "Lớp Service (Nghiệp vụ)",
              ["«interface» OrderService", "«interface» PaymentService",
               "«interface» AuthService", "«interface» VoucherService",
               "«interface» AnalyticsService",
               "OrderServiceImpl, ... (9 impl)"])
p3 = draw_pkg(ax, 0.545, 0.885, 0.215, 0.30, "Lớp Repository (Truy xuất)",
              ["OrderRepository", "OrderItemRepository",
               "MenuItemRepository", "PaymentRepository",
               "UserRepository",
               "extends JpaRepository (Spring Data)"])
p4 = draw_pkg(ax, 0.805, 0.885, 0.180, 0.30, "Lớp Entity (Dữ liệu)",
              ["User", "RestaurantTable", "Category", "MenuItem",
               "Order", "OrderItem", "Payment", "Voucher"])
p5 = draw_pkg(ax, 0.025, 0.375, 0.215, 0.26, "Lớp DTO (Truyền dữ liệu)",
              ["OrderRequest / OrderResponse",
               "PaymentRequest / PaymentResponse",
               "AuthResponse", "BankQrResponse",
               "DashboardStatsResponse", "..."])
p6 = draw_pkg(ax, 0.285, 0.375, 0.215, 0.26, "Lớp Bảo mật (Security)",
              ["JwtAuthenticationFilter", "JwtTokenProvider",
               "CustomUserDetailsService", "UserPrincipal",
               "JwtAuthenticationEntryPoint"])
p7 = draw_pkg(ax, 0.545, 0.375, 0.215, 0.26, "Lớp Cấu hình (Config)",
              ["SecurityConfig", "DataInitializer",
               "application.yml", "Dockerfile",
               "docker-compose.yml"])

arrow(ax, (p1.x1, p1.cy - 0.02), (p2.x0, p2.cy - 0.02), "dep", "«gọi»")
arrow(ax, (p2.x1, p2.cy - 0.02), (p3.x0, p3.cy - 0.02), "dep", "«truy cập»")
arrow(ax, (p3.x1, p3.cy - 0.02), (p4.x0, p4.cy - 0.02), "dep", "«án xạ ORM»")
arrow(ax, (p1.x0 + 0.04, p1.y0), (p5.x0 + 0.04, p5.y1), "dep", "«đóng gói»")
arrow(ax, (p1.cx, p1.y0), (p6.x0 + 0.12, p6.y1), "dep", "«xác thực JWT»", lab_dx=-0.02)
arrow(ax, (p2.cx, p2.y0), (p7.x0 + 0.12, p7.y1), "dep", "«tự động cấu hình»", lab_dx=-0.02)

draw_note(ax, 0.845, 0.375, 0.27, [
    "Kiến trúc phân tầng (Layered Architecture):",
    "• Controller tiếp nhận yêu cầu REST,",
    "  ủy quyền cho Service xử lý nghiệp vụ.",
    "• Service dùng Repository truy cập dữ liệu",
    "  thông qua Spring Data JPA / Hibernate.",
    "• DTO cách ly dữ liệu truyền tải với",
    "  mô hình thực thể; Security chặn lọc JWT",
    "  trước khi vào Controller."])
save(fig, "class-tong-quan.png")

# ============================================================== 2. CLASS DOMAIN
fig, ax = new_ax((17, 12.5), "Hình 2.6 – Biểu đồ lớp chi tiết mô hình nghiệp vụ (domain model)")

cat = draw_class(ax, 0.105, 0.925, "Category", [
    "- id: Long", "- name: String", "- description: String",
    "- image: String", "- status: CategoryStatus"], w=0.185)
mi = draw_class(ax, 0.365, 0.925, "MenuItem", [
    "- id: Long", "- name: String", "- description: String",
    "- price: BigDecimal", "- image: String",
    "- status: MenuItemStatus"], ["+ isAvailable(): boolean"], w=0.195)
oi = draw_class(ax, 0.645, 0.925, "OrderItem", [
    "- id: Long", "- quantity: Integer", "- price: BigDecimal",
    "- note: String", "- status: OrderItemStatus"],
    ["+ getSubtotal(): BigDecimal"], w=0.195)
enum_r = draw_pkg(ax, 0.845, 0.945, 0.150, 0.225, "«enumeration»",
                  ["OrderStatus", "OrderType", "OrderItemStatus",
                   "PaymentMethod", "PaymentStatus", "TableStatus",
                   "Role", "UserStatus", "CategoryStatus",
                   "MenuItemStatus", "DiscountType"], fs=7.0)

usr = draw_class(ax, 0.105, 0.520, "User", [
    "- id: Long", "- username: String", "- password: String",
    "- fullName: String", "- email: String", "- phone: String",
    "- address: String", "- role: Role", "- status: UserStatus"],
    ["+ isActive(): boolean"], w=0.195)
odr = draw_class(ax, 0.645, 0.575, "Order", [
    "- id: Long", "- orderCode: String", "- orderType: OrderType",
    "- status: OrderStatus", "- totalAmount: BigDecimal",
    "- deliveryAddress: String", "- contactPhone: String",
    "- note: String", "- createdAt: LocalDateTime"],
    ["+ calculateTotal(): BigDecimal"], w=0.225)
pay = draw_class(ax, 0.895, 0.560, "Payment", [
    "- id: Long", "- paymentMethod: PaymentMethod",
    "- amount: BigDecimal", "- voucherCode: String",
    "- discountAmount: BigDecimal", "- status: PaymentStatus",
    "- paidAt: LocalDateTime"], ["+ isCompleted(): boolean"], w=0.195)
tbl = draw_class(ax, 0.365, 0.215, "RestaurantTable", [
    "- id: Long", "- tableNumber: String", "- capacity: Integer",
    "- status: TableStatus", "- qrCode: String"],
    ["+ isAvailable(): boolean"], w=0.205)
vou = draw_class(ax, 0.645, 0.300, "Voucher", [
    "- id: Long", "- code: String", "- discountType: DiscountType",
    "- discountValue: BigDecimal", "- maxDiscountAmount: BigDecimal",
    "- minOrderAmount: BigDecimal", "- startDate / endDate: LocalDateTime",
    "- usageLimit: Integer", "- usedCount: Integer", "- active: Boolean"],
    ["+ isValid(): boolean", "+ calculateDiscount(amount): BigDecimal"],
    w=0.235)

# liên kết + số lượng
p = (cat.x1, 0.875)
arrow(ax, p, (mi.x0, 0.875), "assoc")
mult(ax, (cat.x1, 0.875), "1"); mult(ax, (mi.x0, 0.875), "0..*", dx=-0.028)
arrow(ax, (mi.x1, 0.875), (oi.x0, 0.875), "assoc")
mult(ax, (mi.x1, 0.875), "1"); mult(ax, (oi.x0, 0.875), "0..*", dx=-0.028)
arrow(ax, (odr.x0 + 0.05, odr.y1), (oi.x0 + 0.05, oi.y0), "assoc")
mult(ax, (oi.x0 + 0.05, oi.y0), "1..*", dx=-0.030, dy=-0.014)
mult(ax, (odr.x0 + 0.05, odr.y1), "1", dx=-0.026, dy=0.002)
arrow(ax, (usr.x1, 0.470), (odr.x0, 0.470), "assoc")
mult(ax, (usr.x1, 0.470), "1"); mult(ax, (odr.x0, 0.470), "0..*", dx=-0.028)
arrow(ax, (odr.x1, 0.470), (pay.x0, 0.470), "assoc")
mult(ax, (odr.x1, 0.470), "1"); mult(ax, (pay.x0, 0.470), "0..1", dx=-0.028)
arrow(ax, (tbl.x1, 0.185), (odr.x0 + 0.02, 0.385), "assoc")
mult(ax, (tbl.x1, 0.185), "1", dy=-0.012); mult(ax, (odr.x0 + 0.02, 0.385), "0..*", dx=-0.032)
arrow(ax, (vou.x1, 0.185), (pay.x0 + 0.01, 0.455), "dep",
      "«tham chiếu qua voucherCode»", lab_dx=0.055, lab_dy=-0.01)

draw_note(ax, 0.115, 0.215, 0.215, [
    "Mô hình nghiệp vụ chuẩn hóa",
    "theo hướng đối tượng (OOP):",
    "8 lớp thực thể ánh xạ 1-1",
    "với 8 bảng trong MySQL",
    "nhờ Spring Data JPA / Hibernate."])
save(fig, "class-domain.png")

# ====================================================== 3. SEQUENCE: ĐĂNG NHẬP
def lifeline(ax, x, name, stereo=None, w=0.145, y_top=0.945, y_bot=0.075):
    hdr_h = 0.052 if stereo else 0.042
    if stereo:
        ax.add_patch(Rectangle((x - w / 2, y_top - hdr_h), w, hdr_h, facecolor=HDR_FILL,
                               edgecolor=EDGE, lw=1.25, zorder=6))
        ax.text(x, y_top - 0.017, f"«{stereo}»", ha="center", va="center",
                fontsize=7.2, style="italic", color=DARK, zorder=7)
        ax.text(x, y_top - 0.038, name, ha="center", va="center", fontsize=8.4,
                fontweight="bold", color=DARK, zorder=7)
    else:
        ax.add_patch(Rectangle((x - w / 2, y_top - hdr_h), w, hdr_h, facecolor=HDR_FILL,
                               edgecolor=EDGE, lw=1.25, zorder=6))
        ax.text(x, y_top - hdr_h / 2, name, ha="center", va="center", fontsize=8.4,
                fontweight="bold", color=DARK, zorder=7)
    ax.add_line(Line2D([x, x], [y_top - hdr_h, y_bot], color="#64748b",
                       lw=1.15, linestyle=(0, (4, 3)), zorder=2))


def act_bar(ax, x, y0, y1):
    ax.add_patch(Rectangle((x - 0.0045, y0), 0.009, y1 - y0, facecolor="#94a3b8",
                           edgecolor="#475569", lw=0.7, zorder=4))


def msg(ax, y, x_from, x_to, label, style="sync", num=None, lab_dy=0.008,
        self_rect=None):
    ls = "solid" if style == "sync" else (0, (3, 2.2))
    col = DARK if style == "sync" else "#475569"
    if x_from == x_to:
        ax.add_patch(FancyArrowPatch((x_from, y), (x_from + 0.028, y),
                                     arrowstyle="-|>", mutation_scale=10,
                                     color=col, lw=1.1, zorder=4,
                                     connectionstyle="arc3,rad=-1.6"))
        xt = x_from + 0.032
    else:
        ax.add_patch(FancyArrowPatch((x_from, y), (x_to, y), arrowstyle="-|>",
                                     mutation_scale=11, color=col, lw=1.15,
                                     linestyle=ls, zorder=4))
        xt = (x_from + x_to) / 2
    txt = f"{num}. {label}" if num else label
    ax.text(xt, y + lab_dy, txt, ha="center", va="bottom", fontsize=7.4,
            color=DARK, zorder=5)


def alt_frame(ax, y_top, y_bot, label, dividers=()):
    x0, x1 = 0.035, 0.965
    ax.add_patch(Rectangle((x0, y_bot), x1 - x0, y_top - y_bot, facecolor="none",
                           edgecolor="#334155", lw=1.2, zorder=3))
    ax.add_patch(Rectangle((x0, y_top - 0.028), 0.075, 0.028, facecolor="white",
                           edgecolor="#334155", lw=1.0, zorder=4))
    ax.text(x0 + 0.010, y_top - 0.014, label, ha="left", va="center",
            fontsize=7.6, fontweight="bold", color=DARK, zorder=5)
    for y, txt in dividers:
        ax.add_line(Line2D([x0, x1], [y, y], color="#334155", lw=1.0,
                           linestyle=(0, (4, 2.5)), zorder=3))
        ax.add_patch(Rectangle((x0, y - 0.014), 0.16, 0.028, facecolor="white",
                               edgecolor="#334155", lw=0.9, zorder=4))
        ax.text(x0 + 0.010, y, txt, ha="left", va="center", fontsize=7.2,
                color=DARK, zorder=5)


fig, ax = new_ax((15, 11), "Hình 2.7 – Biểu đồ tuần tự: Đăng nhập hệ thống (UC02)")
xs = [0.095, 0.265, 0.445, 0.625, 0.805, 0.945]
names = [("Khách hàng /\nNhân viên /\nQuản trị viên", None),
         ("Trình duyệt\n(React SPA)", "boundary"),
         ("AuthController", "control"),
         ("AuthService", "control"),
         ("UserRepository", "entity"),
         ("JwtTokenProvider", None)]
for x, (n, s) in zip(xs, names):
    lifeline(ax, x, n, s)
y = 0.865
steps = [
    (0, 1, "Nhập tên đăng nhập và mật khẩu"),
    (1, 2, "POST /api/auth/login { username, password }"),
    (2, 3, "login(loginRequest)"),
    (3, 4, "findByUsername(username)"),
    (3, 3, "Kiểm tra mật khẩu (PasswordEncoder)"),
    (3, 3, "Kiểm tra trạng thái tài khoản"),
    (3, 5, "generateToken(userPrincipal)"),
    (3, 2, "AuthResponse { JWT, thông tin tài khoản }"),
    (2, 1, "200 OK + JWT"),
    (1, 0, "Lưu token, điều hướng theo vai trò"),
]
for i, (a, b, lab) in enumerate(steps, 1):
    style = "ret" if a != b and i in (5, 8, 9) else "sync"
    msg(ax, y, xs[a], xs[b], lab, style, num=i)
    y -= 0.062
alt_frame(ax, 0.828, 0.442, "alt", [
    (0.566, "or [Sai thông tin đăng nhập]"),
    (0.504, "or [Tài khoản bị khóa (INACTIVE)]")])
draw_note(ax, 0.5, 0.405, 0.62, [
    "Sau khi đăng nhập thành công, Axios Interceptor tự động đính kèm JWT",
    "vào tiêu đề (Authorization) của mọi yêu cầu API tiếp theo;",
    "hết hạn token, hệ thống tự động yêu cầu đăng nhập lại."])
save(fig, "sequence-dang-nhap.png")

# ======================================================= 4. SEQUENCE: ĐẶT MÓN
fig, ax = new_ax((15, 11), "Hình 2.8 – Biểu đồ tuần tự: Đặt món của Khách hàng (UC08)")
xs = [0.095, 0.275, 0.455, 0.655, 0.885]
names = [("Khách hàng", None), ("Trình duyệt\n(React SPA)", "boundary"),
         ("OrderController", "control"), ("OrderService", "control"),
         ("CSDL MySQL\n(JPA)", "entity")]
for x, (n, s) in zip(xs, names):
    lifeline(ax, x, n, s)
y = 0.875
steps = [
    (0, 1, "Chọn món, số lượng, ghi chú vào giỏ hàng"),
    (1, 2, "POST /api/customer/orders { orderType, tableId, items, ... }"),
    (2, 3, "createCustomerOrder(request, customerId)"),
    (3, 4, "Tìm bàn (nếu ăn tại bàn), kiểm tra bàn tồn tại"),
    (3, 4, "Cập nhật bàn → OCCUPIED (nếu bàn đang trống)"),
    (3, 4, "Kiểm tra từng món còn trạng thái AVAILABLE"),
    (3, 4, "Lưu Order (mã ORD-...) + OrderItems (PENDING), tính tổng tiền"),
    (3, 2, "OrderResponse { mã đơn, tổng tiền, trạng thái }"),
    (2, 1, "201 Created"),
    (1, 0, "Hiển thị mã đơn, bắt đầu theo dõi tiến độ (UC09)"),
]
for i, (a, b, lab) in enumerate(steps, 1):
    style = "ret" if i in (8, 9) else "sync"
    msg(ax, y, xs[a], xs[b], lab, style, num=i)
    y -= 0.062
alt_frame(ax, 0.838, 0.235, "alt", [
    (0.421, "or [Có món hết hàng / thiếu bàn / thiếu địa chỉ]")])
draw_note(ax, 0.5, 0.198, 0.66, [
    "Nếu khách đã đăng nhập, đơn hàng được gắn với tài khoản để lưu lịch sử (UC12).",
    "Mã đơn hàng (ORD-thời gian-số ngẫu nhiên) là duy nhất, dùng để tra cứu",
    "và làm nội dung chuyển khoản khi thanh toán."])
save(fig, "sequence-dat-mon.png")

# =================================================== 5. SEQUENCE: THANH TOÁN
fig, ax = new_ax((15.5, 11.5), "Hình 2.9 – Biểu đồ tuần tự: Xử lý thanh toán (UC17)")
xs = [0.075, 0.215, 0.365, 0.515, 0.665, 0.815, 0.935]
names = [("Nhân viên\nphục vụ", None), ("Trình duyệt\n(React SPA)", "boundary"),
         ("StaffPayment\nController", "control"), ("PaymentService", "control"),
         ("VoucherService", "control"), ("CSDL MySQL", "entity"),
         ("Dịch vụ\nVietQR", None)]
for x, (n, s) in zip(xs, names):
    lifeline(ax, x, n, s, w=0.12)
y = 0.885
steps = [
    (0, 1, "Chọn đơn cần thanh toán → Xem trước hóa đơn (UC18)"),
    (1, 2, "GET /api/staff/payment/receipt/{orderId}"),
    (2, 3, "getPaymentByOrderId(orderId) — hóa đơn tạm tính"),
    (3, 5, "Truy vấn đơn hàng, tổng tiền"),
    (0, 1, "Nhập mã giảm giá (nếu có), chọn phương thức thanh toán"),
    (1, 2, "POST /api/staff/payment/process { orderId, method, voucherCode }"),
    (2, 3, "processStaffPayment(request)"),
]
for i, (a, b, lab) in enumerate(steps, 1):
    style = "ret" if i == 3 else "sync"
    msg(ax, y, xs[a], xs[b], lab, style, num=i)
    y -= 0.056
y -= 0.028
steps2 = [
    (3, 4, "applyVoucherAndIncrementUsage(code, total)  [nếu có voucher]"),
    (4, 5, "Kiểm tra hạn dùng, số lượt, mức tối thiểu"),
    (4, 3, "Số tiền giảm (server tự tính, không tin client)"),
    (1, 2, "GET /api/staff/payment/qr/{orderId}  [nếu chuyển khoản]"),
    (3, 6, "Sinh mã QR theo chuẩn VietQR (nội dung = mã đơn)"),
    (3, 5, "Lưu Payment (COMPLETED), Order → PAID"),
    (3, 5, "Giải phóng bàn → AVAILABLE (đơn ăn tại bàn)"),
    (3, 2, "PaymentResponse { hóa đơn }"),
    (2, 1, "200 OK"),
    (1, 0, "Xác nhận đã nhận tiền, in/gửi hóa đơn cho khách"),
]
for i, (a, b, lab) in enumerate(steps2, 8):
    style = "ret" if i in (10, 15, 16) else "sync"
    msg(ax, y, xs[a], xs[b], lab, style, num=i)
    y -= 0.056
alt_frame(ax, 0.852, 0.098, "opt", [])
draw_note(ax, 0.5, 0.075, 0.72, [
    "Với thanh toán chuyển khoản: nhân viên kiểm tra sao kê ngân hàng rồi mới xác nhận “đã nhận tiền”.",
    "Số tiền giảm luôn được VoucherService tính lại từ quy tắc của voucher để chống gian lận."])
save(fig, "sequence-thanh-toan.png")

# ================================================ 6. ACTIVITY: ĐẶT MÓN
def act_box(ax, xc, ytop, w, h, text, fs=8.0):
    ax.add_patch(FancyBboxPatch((xc - w / 2, ytop - h), w, h,
                                boxstyle="round,pad=0.002,rounding_size=0.012",
                                facecolor="#eff6ff", edgecolor=EDGE, lw=1.25, zorder=5))
    ax.text(xc, ytop - h / 2, text, ha="center", va="center", fontsize=fs,
            color=DARK, zorder=6, linespacing=1.15)


def decision(ax, xc, yc, w, h, text, fs=7.6):
    ax.add_patch(Polygon([(xc, yc + h / 2), (xc + w / 2, yc), (xc, yc - h / 2),
                          (xc - w / 2, yc)], closed=True, facecolor="#fff7ed",
                         edgecolor=C_EXT, lw=1.25, zorder=5))
    ax.text(xc, yc, text, ha="center", va="center", fontsize=fs, color=DARK,
            zorder=6, linespacing=1.1)


def start_dot(ax, xc, yc, r=0.009):
    ax.add_patch(Circle((xc, yc), r, facecolor=DARK, edgecolor=DARK, zorder=6))


def end_dot(ax, xc, yc, r=0.013):
    ax.add_patch(Circle((xc, yc), r, facecolor="white", edgecolor=DARK, lw=1.6, zorder=6))
    ax.add_patch(Circle((xc, yc), r * 0.5, facecolor=DARK, edgecolor=DARK, zorder=7))


def flow(ax, p_from, p_to, label="", lab_dx=0.012, lab_dy=0, rad=0.0, ha="left"):
    ax.add_patch(FancyArrowPatch(p_from, p_to, arrowstyle="-|>", mutation_scale=11,
                                 color=C_ARR, lw=1.2, shrinkA=1, shrinkB=1,
                                 connectionstyle=f"arc3,rad={rad}", zorder=3))
    if label:
        mx, my = (p_from[0] + p_to[0]) / 2 + lab_dx, (p_from[1] + p_to[1]) / 2 + lab_dy
        ax.text(mx, my, label, ha=ha, va="bottom", fontsize=7.4, color="#b45309",
                zorder=4)


fig, ax = new_ax((14.5, 12), "Hình 2.10 – Biểu đồ hành động: Luồng đặt món của Khách hàng")
start_dot(ax, 0.5, 0.945)
act_box(ax, 0.5, 0.912, 0.30, 0.048, "Xem thực đơn\n(tìm kiếm, lọc danh mục)")
flow(ax, (0.5, 0.938), (0.5, 0.912))
act_box(ax, 0.5, 0.838, 0.30, 0.048, "Thêm món vào giỏ hàng\n(số lượng, ghi chú từng món)")
flow(ax, (0.5, 0.864), (0.5, 0.838))
act_box(ax, 0.5, 0.764, 0.30, 0.048, "Mở giỏ hàng, kiểm tra lại đơn\n(sửa / xóa món, ghi chú đơn)")
flow(ax, (0.5, 0.790), (0.5, 0.764))
act_box(ax, 0.5, 0.690, 0.30, 0.044, "Chọn hình thức đặt món")
flow(ax, (0.5, 0.716), (0.5, 0.690))
decision(ax, 0.5, 0.618, 0.16, 0.062, "Hình thức\nđặt món?")
flow(ax, (0.5, 0.668), (0.5, 0.650))

# nhánh trái: ăn tại bàn
act_box(ax, 0.175, 0.520, 0.26, 0.050, "Xác định bàn ăn\n(chọn sơ đồ bàn / quét mã QR)")
flow(ax, (0.42, 0.600), (0.305, 0.545), "Ăn tại bàn", lab_dx=-0.002, lab_dy=0.008)
decision(ax, 0.175, 0.415, 0.13, 0.052, "Bàn hợp lệ?")
flow(ax, (0.175, 0.495), (0.175, 0.442))
act_box(ax, 0.175, 0.315, 0.24, 0.046, "Thông báo lỗi,\nyêu cầu chọn lại bàn")
flow(ax, (0.11, 0.389), (0.06, 0.338), "Không", lab_dx=0.004, lab_dy=0.004, rad=0.12, ha="right")
flow(ax, (0.06, 0.315), (0.30, 0.520), "", rad=0.35)

# nhánh giữa: mang về
act_box(ax, 0.5, 0.520, 0.24, 0.050, "Nhập số điện thoại\nliên hệ")
flow(ax, (0.5, 0.587), (0.5, 0.545), "Mang về", lab_dx=-0.052)

# nhánh phải: giao tận nơi
act_box(ax, 0.825, 0.520, 0.26, 0.050, "Nhập địa chỉ giao hàng\n+ số điện thoại")
flow(ax, (0.58, 0.600), (0.695, 0.545), "Giao tận nơi", lab_dx=0.002, lab_dy=0.008)

# hợp nhất
flow(ax, (0.175, 0.389), (0.175, 0.360), "Có")
act_box(ax, 0.355, 0.283, 0.26, 0.044, "Hợp nhất thông tin đơn hàng")
flow(ax, (0.175, 0.360), (0.30, 0.305))
flow(ax, (0.5, 0.495), (0.42, 0.305))
flow(ax, (0.825, 0.495), (0.63, 0.305))
decision(ax, 0.355, 0.196, 0.17, 0.056, "Món còn bán &\nthông tin hợp lệ?")
flow(ax, (0.355, 0.261), (0.355, 0.225))
act_box(ax, 0.72, 0.196, 0.28, 0.046, "Thông báo lỗi,\ncập nhật lại giỏ hàng")
flow(ax, (0.44, 0.196), (0.58, 0.196), "Không", lab_dy=0.006)
flow(ax, (0.72, 0.242), (0.62, 0.700), "", rad=-0.3)
act_box(ax, 0.355, 0.118, 0.30, 0.048, "Sinh mã đơn (ORD-...),\ntạo Order + OrderItems (PENDING)")
flow(ax, (0.355, 0.168), (0.355, 0.142), "Có")
act_box(ax, 0.355, 0.052, 0.30, 0.044, "Cập nhật bàn → OCCUPIED (nếu tại bàn),\nghi nhận tài khoản (nếu đã đăng nhập)")
flow(ax, (0.355, 0.094), (0.355, 0.074))
end_dot(ax, 0.355, 0.014)
flow(ax, (0.355, 0.030), (0.355, 0.026))
save(fig, "activity-dat-mon.png")

# ============================================= 7. ACTIVITY: THANH TOÁN
fig, ax = new_ax((14, 12), "Hình 2.11 – Biểu đồ hành động: Luồng xử lý thanh toán tại quầy")
start_dot(ax, 0.5, 0.950)
act_box(ax, 0.5, 0.918, 0.32, 0.046, "Nhân viên chọn đơn hàng cần thanh toán")
flow(ax, (0.5, 0.944), (0.5, 0.918))
act_box(ax, 0.5, 0.850, 0.32, 0.046, "Xem trước hóa đơn (UC18):\nmón, số lượng, tổng tiền")
flow(ax, (0.5, 0.872), (0.5, 0.850))
decision(ax, 0.5, 0.762, 0.18, 0.058, "Khách có mã\ngiảm giá?")
flow(ax, (0.5, 0.827), (0.5, 0.792))
act_box(ax, 0.20, 0.672, 0.26, 0.046, "Nhập mã giảm giá")
flow(ax, (0.41, 0.748), (0.28, 0.695), "Có", lab_dy=0.006)
decision(ax, 0.20, 0.572, 0.17, 0.056, "Voucher hợp lệ?")
flow(ax, (0.20, 0.649), (0.20, 0.601))
act_box(ax, 0.20, 0.462, 0.28, 0.050, "Tính số tiền giảm\n(theo quy tắc voucher)")
flow(ax, (0.20, 0.543), (0.20, 0.488), "Có")
act_box(ax, 0.86, 0.572, 0.25, 0.046, "Thông báo mã không hợp lệ,\ntiếp tục không giảm")
flow(ax, (0.285, 0.572), (0.735, 0.572), "Không", lab_dy=0.006)
flow(ax, (0.86, 0.549), (0.62, 0.392))
act_box(ax, 0.575, 0.672, 0.24, 0.042, "Không áp dụng giảm giá")
flow(ax, (0.59, 0.748), (0.575, 0.693), "Không", lab_dx=0.006, lab_dy=0.004)
act_box(ax, 0.5, 0.368, 0.34, 0.046, "Hợp nhất số tiền phải thu,\nchọn phương thức thanh toán")
flow(ax, (0.20, 0.436), (0.38, 0.392))
flow(ax, (0.575, 0.649), (0.575, 0.392))
decision(ax, 0.5, 0.282, 0.19, 0.056, "Phương thức\nthanh toán?")
flow(ax, (0.5, 0.345), (0.5, 0.311))
act_box(ax, 0.20, 0.182, 0.28, 0.052, "Sinh mã QR VietQR,\nkhách chuyển khoản,\nnhân viên xác nhận sao kê")
flow(ax, (0.415, 0.268), (0.295, 0.210), "Chuyển khoản", lab_dy=0.006)
act_box(ax, 0.80, 0.182, 0.26, 0.052, "Thu tiền mặt / quét ví,\nxác nhận số tiền nhận")
flow(ax, (0.585, 0.268), (0.705, 0.210), "Tiền mặt / ví", lab_dy=0.006)
act_box(ax, 0.5, 0.104, 0.36, 0.046, "Ghi nhận thanh toán:\nPayment COMPLETED, Order → PAID")
flow(ax, (0.20, 0.154), (0.36, 0.128))
flow(ax, (0.80, 0.154), (0.64, 0.128))
act_box(ax, 0.5, 0.048, 0.36, 0.042, "Giải phóng bàn (nếu hết đơn),\nin / gửi hóa đơn cho khách")
flow(ax, (0.5, 0.081), (0.5, 0.070))
end_dot(ax, 0.5, 0.012)
flow(ax, (0.5, 0.027), (0.5, 0.024))
save(fig, "activity-thanh-toan.png")

# ==================================================== 8. COMPONENT
def component(ax, xc, ytop, name, items, w=0.26, fs=7.6, stereo=None):
    n = len(items)
    h = 0.052 + n * 0.021 + (0.018 if stereo else 0)
    x0, y0 = xc - w / 2, ytop - h
    ax.add_patch(Rectangle((x0, y0), w, h, facecolor=BOX_FILL, edgecolor=EDGE,
                           lw=1.3, zorder=5))
    tab_h, tab_w = 0.026, 0.016
    for ty in (ytop - 0.035, y0 + 0.030):
        ax.add_patch(Rectangle((x0 - tab_w, ty), tab_w, tab_h, facecolor=HDR_FILL,
                               edgecolor=EDGE, lw=1.2, zorder=6))
    yy = ytop - 0.016
    if stereo:
        ax.text(xc, yy, f"«{stereo}»", ha="center", va="top", fontsize=7.2,
                style="italic", color=DARK, zorder=7)
        yy -= 0.018
    ax.text(xc, yy, name, ha="center", va="top", fontsize=8.8, fontweight="bold",
            color=DARK, zorder=7)
    yy -= 0.026
    for it in items:
        ax.text(x0 + 0.010, yy, it, ha="left", va="top", fontsize=fs, color=DARK,
                zorder=7, family="monospace")
        yy -= 0.021
    return Rect(x0, y0, x0 + w, ytop)


fig, ax = new_ax((15, 10.5), "Hình 2.12 – Biểu đồ thành phần của hệ thống")
fe = component(ax, 0.135, 0.870, "Ứng dụng Frontend (React SPA)", [
    "TrangDatMon (Menu + Giỏ hàng)", "TrangDangNhap / TaiKhoan",
    "TrangNhanVien (Đơn + Bàn)", "TrangQuanTri (Dashboard)",
    "Axios Client + JWT Interceptor"], w=0.235, stereo="application")
ng = component(ax, 0.445, 0.870, "Nginx (Web Server)", [
    "Reverse Proxy /api/**", "Serve static SPA",
    "Cổng 80 (container)"], w=0.185, stereo="web server")
be = component(ax, 0.755, 0.870, "Spring Boot Backend", [
    "REST Controllers (17)", "Services + Impls (9)",
    "Spring Data JPA (8 repo)", "Security: JWT Filter",
    "Config: DataInitializer"], w=0.215, stereo="application")
my = component(ax, 0.445, 0.310, "MySQL 8.0 (Cơ sở dữ liệu)", [
    "user, restaurant_table, category", "menu_item, order, order_item",
    "payment, voucher"], w=0.235, stereo="database")
vq = component(ax, 0.815, 0.310, "Dịch vụ VietQR\n(img.vietqr.io)", [
    "Sinh mã QR chuyển khoản"], w=0.195, stereo="external service")

arrow(ax, (fe.x1, fe.cy), (ng.x0, ng.cy), "dep", "«HTTPS / SPA + /api»")
arrow(ax, (ng.x1, ng.cy), (be.x0, be.cy), "dep", "«RESTful API (JSON)»")
arrow(ax, (be.x0 + 0.02, be.y0), (my.x0 + 0.06, my.y1), "dep", "«JPA / JDBC»", lab_dx=-0.02)
arrow(ax, (be.x1, be.y0 - 0.04), (vq.x1 - 0.02, vq.y1), "dep", "«HTTPS»", lab_dx=0.035)
draw_note(ax, 0.155, 0.310, 0.26, [
    "Mối quan hệ giữa các thành phần:",
    "• Frontend gọi REST API qua Nginx.",
    "• Backend ủy quyền xử lý theo",
    "  kiến trúc Controller – Service –",
    "  Repository (mẫu Service Layer,",
    "  mẫu Repository, mẫu DTO).",
    "• Backend truy cập MySQL bằng",
    "  Spring Data JPA (ORM)."])
save(fig, "component-he-thong.png")

# ==================================================== 9. DEPLOYMENT
def node3d(ax, x0, y0, w, h, label, stereo=None, depth=0.022, fs=8.6):
    ax.add_patch(Rectangle((x0, y0), w, h, facecolor="#f1f5f9", edgecolor="#334155",
                           lw=1.35, zorder=5))
    ax.add_patch(Polygon([(x0, y0 + h), (x0 + depth, y0 + h + depth * 0.72),
                          (x0 + w + depth, y0 + h + depth * 0.72), (x0 + w, y0 + h)],
                         closed=True, facecolor="#e2e8f0", edgecolor="#334155",
                         lw=1.35, zorder=5))
    ax.add_patch(Polygon([(x0 + w, y0), (x0 + w + depth, y0 + depth * 0.72),
                          (x0 + w + depth, y0 + h + depth * 0.72), (x0 + w, y0 + h)],
                         closed=True, facecolor="#cbd5e1", edgecolor="#334155",
                         lw=1.35, zorder=5))
    yy = y0 + h - 0.016
    if stereo:
        ax.text(x0 + 0.012, yy, f"«{stereo}»", ha="left", va="top", fontsize=7.4,
                style="italic", color=DARK, zorder=6)
        yy -= 0.020
    ax.text(x0 + 0.012, yy, label, ha="left", va="top", fontsize=fs,
            fontweight="bold", color=DARK, zorder=6, linespacing=1.1)
    return Rect(x0, y0, x0 + w, y0 + h)


def artifact(ax, xc, ytop, name, w=0.155, fs=7.2):
    h = 0.030
    fold = 0.011
    x0, y0 = xc - w / 2, ytop - h
    ax.add_patch(Polygon([(x0, y0), (x0, ytop), (x0 + w - fold, ytop),
                          (x0 + w, ytop - fold), (x0 + w, y0)], closed=True,
                         facecolor="white", edgecolor="#475569", lw=1.0, zorder=7))
    ax.add_line(Line2D([x0 + w - fold, x0 + w - fold, x0 + w],
                       [ytop, ytop - fold, ytop - fold], color="#475569", lw=1.0, zorder=8))
    ax.text(xc, y0 + h / 2 - 0.002, name, ha="center", va="center", fontsize=fs,
            color=DARK, zorder=8)
    return Rect(x0, y0, x0 + w, ytop)


fig, ax = new_ax((15, 10.5), "Hình 2.13 – Biểu đồ triển khai của hệ thống")
dev = node3d(ax, 0.035, 0.700, 0.225, 0.215, "Thiết bị người dùng\n(PC / Điện thoại)", "device")
artifact(ax, 0.148, 0.812, "restaurant-spa (React build)")
ax.text(0.148, 0.762, "Trình duyệt web\n(Chrome, Safari...)", ha="center", va="top",
        fontsize=7.4, color="#475569", zorder=7)

host = node3d(ax, 0.395, 0.085, 0.545, 0.760, "Máy chủ triển khai (Docker Host)", "execution environment")
c1 = node3d(ax, 0.425, 0.615, 0.225, 0.145, "restaurant_frontend\n(Nginx Alpine)", "container")
artifact(ax, 0.538, 0.700, "nginx.conf + SPA static")
c2 = node3d(ax, 0.685, 0.615, 0.225, 0.145, "restaurant_backend\n(Spring Boot — JDK 17)", "container")
artifact(ax, 0.798, 0.700, "app.jar (port 8081)")
c3 = node3d(ax, 0.545, 0.315, 0.245, 0.145, "restaurant_mysql\n(MySQL 8.0)", "container")
artifact(ax, 0.668, 0.400, "mysql_data (volume)")
ax.text(0.545, 0.205, "Docker Compose orchestrate 3 container,\nmạng nội bộ bridge, volume giữ dữ liệu",
        ha="center", va="top", fontsize=7.6, color="#475569", zorder=7)

vq = node3d(ax, 0.035, 0.245, 0.225, 0.150, "Dịch vụ VietQR\n(cloud)", "external system")
ax.text(0.148, 0.305, "img.vietqr.io", ha="center", va="top", fontsize=7.4,
        color="#475569", zorder=7)

arrow(ax, (dev.x1, dev.cy), (c1.x0 + 0.02, c1.y1 - 0.03), "dep", "«HTTPS»  Internet", lab_dy=0.012)
arrow(ax, (c1.x1, c1.cy), (c2.x0, c2.cy), "dep", "«HTTP — reverse proxy /api»", lab_dy=0.010)
arrow(ax, (c2.x0 + 0.06, c2.y0), (c3.x0 + 0.10, c3.y1), "dep", "«TCP 3306 (mạng nội bộ)»", lab_dx=0.02)
arrow(ax, (c2.x0 + 0.02, c2.y0 - 0.012), (vq.x1, vq.y1 - 0.045), "dep",
      "«HTTPS 443 — sinh mã QR»", lab_dx=0.0, lab_dy=0.014)
save(fig, "deployment-he-thong.png")
