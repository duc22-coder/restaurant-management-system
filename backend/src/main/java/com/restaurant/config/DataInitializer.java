package com.restaurant.config;

import com.restaurant.entity.*;
import com.restaurant.enums.*;
import com.restaurant.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RestaurantTableRepository tableRepository;
    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final PasswordEncoder passwordEncoder;
    private final ProductDetailRepository productDetailRepository;
    private final ProductRecipeRepository productRecipeRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderItemRepository purchaseOrderItemRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedUsers();
        seedTables();
        seedCategoriesAndMenuItems();
        seedInventoryAndPurchases();
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            log.info("Creating initial users (admin, staff)...");

            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("Quản Lý Nhà Hàng")
                    .email("admin@restaurant.com")
                    .phone("0901234567")
                    .role(Role.ADMIN)
                    .status(UserStatus.ACTIVE)
                    .build();

            User staff = User.builder()
                    .username("staff")
                    .password(passwordEncoder.encode("staff123"))
                    .fullName("Nhân Viên Phục Vụ")
                    .email("staff@restaurant.com")
                    .phone("0907654321")
                    .role(Role.STAFF)
                    .status(UserStatus.ACTIVE)
                    .build();

            userRepository.saveAll(List.of(admin, staff));
            log.info("Initial users created successfully!");
        }
    }

    private void seedTables() {
        if (tableRepository.count() == 0) {
            log.info("Creating initial tables (B01 -> B08)...");

            for (int i = 1; i <= 8; i++) {
                String tableNumber = String.format("B%02d", i);
                int capacity = (i % 2 == 0) ? 4 : 2;
                if (i >= 7) capacity = 8; // Bàn VIP lớn

                RestaurantTable table = RestaurantTable.builder()
                        .tableNumber(tableNumber)
                        .capacity(capacity)
                        .status(TableStatus.AVAILABLE)
                        .qrCode("/menu?tableId=" + i)
                        .build();

                tableRepository.save(table);
            }
            log.info("8 initial tables created successfully!");
        }
    }

    private void seedCategoriesAndMenuItems() {
        if (categoryRepository.count() == 0) {
            log.info("Creating initial categories and menu items...");

            // 1. Khai vị
            Category c1 = Category.builder()
                    .name("Khai Vị")
                    .description("Các món ăn nhẹ kích thích vị giác trước bữa chính")
                    .image("https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop")
                    .status(CategoryStatus.ACTIVE)
                    .build();
            categoryRepository.save(c1);

            MenuItem m1 = MenuItem.builder()
                    .category(c1)
                    .name("Gỏi Cuốn Tôm Thịt (4 Cuốn)")
                    .description("Tôm tươi, thịt ba chỉ, bún và rau sống cuốn bánh tráng kèm nước chấm phở đậu xốt đậm đà")
                    .price(new BigDecimal("45000"))
                    .image("https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop")
                    .status(MenuItemStatus.AVAILABLE)
                    .build();

            MenuItem m2 = MenuItem.builder()
                    .category(c1)
                    .name("Chả Giò Hải Sản Chiên Xù")
                    .description("Giòn rụm bên ngoài, nhân tôm mực ngọt tươi bên trong kèm sốt mayonnaise")
                    .price(new BigDecimal("65000"))
                    .image("https://images.unsplash.com/photo-1541529086526-db283c563270?w=600&auto=format&fit=crop")
                    .status(MenuItemStatus.AVAILABLE)
                    .build();

            MenuItem m3 = MenuItem.builder()
                    .category(c1)
                    .name("Khoai Tây Chiên Bơ Tỏi")
                    .description("Khoai tây giòn thơm phức vị bơ tươi và tỏi phi")
                    .price(new BigDecimal("35000"))
                    .image("https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop")
                    .status(MenuItemStatus.AVAILABLE)
                    .build();

            // 2. Món chính
            Category c2 = Category.builder()
                    .name("Món Chính")
                    .description("Thực đơn đậm đà truyền thống chuẩn hương vị Việt")
                    .image("https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop")
                    .status(CategoryStatus.ACTIVE)
                    .build();
            categoryRepository.save(c2);

            MenuItem m4 = MenuItem.builder()
                    .category(c2)
                    .name("Phở Bò Đặc Biệt")
                    .description("Nước dùng hầm xương 12 tiếng, bánh phở tươi kèm tái, nạm, gầu, bò viên")
                    .price(new BigDecimal("65000"))
                    .image("https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&auto=format&fit=crop")
                    .status(MenuItemStatus.AVAILABLE)
                    .build();

            MenuItem m5 = MenuItem.builder()
                    .category(c2)
                    .name("Cơm Tấm Sườn Cốt Lết Trứng")
                    .description("Sườn nướng mật ong thơm lừng, chả trứng hấp, bì tươi kèm nước mắm kẹo ngọt nhẹ")
                    .price(new BigDecimal("55000"))
                    .image("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop")
                    .status(MenuItemStatus.AVAILABLE)
                    .build();

            MenuItem m6 = MenuItem.builder()
                    .category(c2)
                    .name("Bò Lúc Lắc Hạt Tiêu Xanh")
                    .description("Thịt bò Mỹ cắt khối xào nấm, ớt chuông và hạt tiêu xanh thơm nồng kèm khoai tây")
                    .price(new BigDecimal("120000"))
                    .image("https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&auto=format&fit=crop")
                    .status(MenuItemStatus.AVAILABLE)
                    .build();

            MenuItem m7 = MenuItem.builder()
                    .category(c2)
                    .name("Gà Nướng Mật Ong Xôi Chiên")
                    .description("Đùi gà nướng da giòn thấm vị mật ong rừng kèm xôi nướng phồng")
                    .price(new BigDecimal("85000"))
                    .image("https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop")
                    .status(MenuItemStatus.AVAILABLE)
                    .build();

            // 3. Lẩu & Nướng
            Category c3 = Category.builder()
                    .name("Lẩu & Nướng")
                    .description("Các món lẩu và đồ nướng thơm nồng cho nhóm đông người")
                    .image("https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop")
                    .status(CategoryStatus.ACTIVE)
                    .build();
            categoryRepository.save(c3);

            MenuItem m8 = MenuItem.builder()
                    .category(c3)
                    .name("Lẩu Thái Hải Sản Chua Cay (2-3 Người)")
                    .description("Nước lẩu Tomyum đậm vị chua cay kèm tôm sú, mực tươi, bò Mỹ, nấm và rau nhúng")
                    .price(new BigDecimal("280000"))
                    .image("https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop")
                    .status(MenuItemStatus.AVAILABLE)
                    .build();

            MenuItem m9 = MenuItem.builder()
                    .category(c3)
                    .name("Set Bò Nướng Sốt Trứng Muối")
                    .description("Ba chỉ bò Mỹ nướng sốt trứng muối béo ngậy kèm bơ nướng tỏi")
                    .price(new BigDecimal("220000"))
                    .image("https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop")
                    .status(MenuItemStatus.AVAILABLE)
                    .build();

            // 4. Đồ Uống
            Category c4 = Category.builder()
                    .name("Đồ Uống")
                    .description("Trà hoa quả tươi giải nhiệt và sinh tố tự nhiên")
                    .image("https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop")
                    .status(CategoryStatus.ACTIVE)
                    .build();
            categoryRepository.save(c4);

            MenuItem m10 = MenuItem.builder()
                    .category(c4)
                    .name("Trà Đào Sả Tắc")
                    .description("Trà đào thơm nồng vị sả tươi và đào miếng mọng nước")
                    .price(new BigDecimal("30000"))
                    .image("https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop")
                    .status(MenuItemStatus.AVAILABLE)
                    .build();

            MenuItem m11 = MenuItem.builder()
                    .category(c4)
                    .name("Sinh Tố Bơ Dừa")
                    .description("Bơ sáp Da Lát xay nhuyễn với sữa tươi và cơm dừa béo ngậy")
                    .price(new BigDecimal("35000"))
                    .image("https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop")
                    .status(MenuItemStatus.AVAILABLE)
                    .build();

            MenuItem m12 = MenuItem.builder()
                    .category(c4)
                    .name("Coca Cola Chilled")
                    .description("Lon 330ml ướp lạnh kèm ly đá")
                    .price(new BigDecimal("18000"))
                    .image("https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop")
                    .status(MenuItemStatus.AVAILABLE)
                    .build();

            menuItemRepository.saveAll(List.of(m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12));
            log.info("Categories and Menu items created successfully!");
        }
    }

    private void seedInventoryAndPurchases() {
        if (productDetailRepository.count() == 0) {
            log.info("Seeding SPCT (Product Details), TPSP (Recipes), and Purchase Orders...");

            List<MenuItem> allMenuItems = menuItemRepository.findAll();
            if (allMenuItems.isEmpty()) return;

            // 1. Tạo Category "Nguyên Liệu Kho" để quản lý các mặt hàng nguyên vật liệu
            Category rawCategory = Category.builder()
                    .name("Nguyên Liệu & Kho")
                    .description("Các mặt hàng nguyên liệu thô phục vụ chế biến trong bếp và quầy bar")
                    .image("https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop")
                    .status(CategoryStatus.ACTIVE)
                    .build();
            categoryRepository.save(rawCategory);

            MenuItem rawBeef = MenuItem.builder()
                    .category(rawCategory)
                    .name("Thịt Bò Mỹ Tươi")
                    .description("Thịt ba chỉ / thăn bò Mỹ nhập khẩu")
                    .price(new BigDecimal("280000"))
                    .image("https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&auto=format&fit=crop")
                    .status(MenuItemStatus.AVAILABLE)
                    .build();

            MenuItem rawShrimp = MenuItem.builder()
                    .category(rawCategory)
                    .name("Tôm Sú Tươi Sống")
                    .description("Tôm sú tươi sống loại 1 size 20 con/kg")
                    .price(new BigDecimal("320000"))
                    .image("https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&auto=format&fit=crop")
                    .status(MenuItemStatus.AVAILABLE)
                    .build();

            MenuItem rawRice = MenuItem.builder()
                    .category(rawCategory)
                    .name("Gạo Thơm Lài Miên")
                    .description("Gạo dẻo thơm chuyên dùng nấu cơm chiên cao cấp")
                    .price(new BigDecimal("25000"))
                    .image("https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop")
                    .status(MenuItemStatus.AVAILABLE)
                    .build();

            MenuItem rawPeach = MenuItem.builder()
                    .category(rawCategory)
                    .name("Đào Ngâm Đóng Hộp")
                    .description("Đào ngâm đường hộp sắt 820g")
                    .price(new BigDecimal("45000"))
                    .image("https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop")
                    .status(MenuItemStatus.AVAILABLE)
                    .build();

            menuItemRepository.saveAll(List.of(rawBeef, rawShrimp, rawRice, rawPeach));

            // 2. Tạo SPCT (Sản phẩm chi tiết / Biến thể tồn kho)
            ProductDetail dBeef = ProductDetail.builder()
                    .menuItem(rawBeef)
                    .sku("SPCT-BEEF-KG")
                    .variantName("Thịt Bò Mỹ (Kg)")
                    .unit("Kg")
                    .stockQuantity(30.0)
                    .minStockAlert(5.0)
                    .costPrice(new BigDecimal("240000"))
                    .sellingPrice(new BigDecimal("280000"))
                    .status(ProductDetailStatus.ACTIVE)
                    .build();

            ProductDetail dShrimp = ProductDetail.builder()
                    .menuItem(rawShrimp)
                    .sku("SPCT-SHRIMP-KG")
                    .variantName("Tôm Sú Tươi (Kg)")
                    .unit("Kg")
                    .stockQuantity(20.0)
                    .minStockAlert(4.0)
                    .costPrice(new BigDecimal("270000"))
                    .sellingPrice(new BigDecimal("320000"))
                    .status(ProductDetailStatus.ACTIVE)
                    .build();

            ProductDetail dRice = ProductDetail.builder()
                    .menuItem(rawRice)
                    .sku("SPCT-RICE-KG")
                    .variantName("Gạo Thơm (Kg)")
                    .unit("Kg")
                    .stockQuantity(100.0)
                    .minStockAlert(15.0)
                    .costPrice(new BigDecimal("18000"))
                    .sellingPrice(new BigDecimal("25000"))
                    .status(ProductDetailStatus.ACTIVE)
                    .build();

            ProductDetail dPeach = ProductDetail.builder()
                    .menuItem(rawPeach)
                    .sku("SPCT-PEACH-CAN")
                    .variantName("Đào Hộp (Hộp 820g)")
                    .unit("Hộp")
                    .stockQuantity(50.0)
                    .minStockAlert(10.0)
                    .costPrice(new BigDecimal("35000"))
                    .sellingPrice(new BigDecimal("45000"))
                    .status(ProductDetailStatus.ACTIVE)
                    .build();

            // Tìm món Coca Cola và Trà Đào trong Menu để tạo SPCT
            MenuItem cocaItem = allMenuItems.stream()
                    .filter(m -> m.getName().toLowerCase().contains("coca"))
                    .findFirst().orElse(null);
            ProductDetail dCoca = null;
            if (cocaItem != null) {
                dCoca = ProductDetail.builder()
                        .menuItem(cocaItem)
                        .sku("SPCT-COCA-CAN")
                        .variantName("Coca Lon 330ml")
                        .unit("Lon")
                        .stockQuantity(150.0)
                        .minStockAlert(24.0)
                        .costPrice(new BigDecimal("9500"))
                        .sellingPrice(cocaItem.getPrice())
                        .status(ProductDetailStatus.ACTIVE)
                        .build();
                productDetailRepository.save(dCoca);
            }

            productDetailRepository.saveAll(List.of(dBeef, dShrimp, dRice, dPeach));

            // 3. Tạo TPSP (Thành phần sản phẩm / Công thức định lượng)
            // Tìm món Cơm Chiên Hải Sản Hoàng Gia (nếu có)
            MenuItem friedRiceItem = allMenuItems.stream()
                    .filter(m -> m.getName().toLowerCase().contains("cơm chiên"))
                    .findFirst().orElse(null);

            if (friedRiceItem != null) {
                ProductRecipe r1 = ProductRecipe.builder()
                        .product(friedRiceItem)
                        .ingredientDetail(dShrimp)
                        .quantity(0.12) // 120g tôm cho mỗi đĩa cơm chiên
                        .unit("Kg")
                        .note("Tôm bóc nõn cắt hạt lựu")
                        .build();

                ProductRecipe r2 = ProductRecipe.builder()
                        .product(friedRiceItem)
                        .ingredientDetail(dRice)
                        .quantity(0.20) // 200g gạo cho mỗi đĩa cơm
                        .unit("Kg")
                        .note("Gạo nấu cơm khô để nguội trước khi chiên")
                        .build();

                productRecipeRepository.saveAll(List.of(r1, r2));
            }

            // Tìm món Trà Đào Sả Tắc
            MenuItem peachTeaItem = allMenuItems.stream()
                    .filter(m -> m.getName().toLowerCase().contains("trà đào"))
                    .findFirst().orElse(null);

            if (peachTeaItem != null) {
                ProductRecipe r3 = ProductRecipe.builder()
                        .product(peachTeaItem)
                        .ingredientDetail(dPeach)
                        .quantity(0.25) // 1/4 hộp đào cho 1 ly
                        .unit("Hộp")
                        .note("2 lát đào ngâm + 30ml nước đào")
                        .build();
                productRecipeRepository.save(r3);
            }

            // 4. Tạo Phiếu nhập kho mẫu (ĐNP - PurchaseOrder & CT ĐN - PurchaseOrderItem)
            User adminUser = userRepository.findByUsername("admin").orElse(null);
            if (adminUser != null) {
                PurchaseOrder po = PurchaseOrder.builder()
                        .code("PN261001001")
                        .creator(adminUser)
                        .supplierName("Công Ty Nông Sản Thực Phẩm Sạch Đà Lạt")
                        .supplierPhone("02838999999")
                        .supplierAddress("45 Đường 3/2, Phường 11, Quận 10, TP.HCM")
                        .status(PurchaseOrderStatus.COMPLETED)
                        .note("Đợt nhập nguyên liệu tươi đầu tháng cho nhà hàng")
                        .totalAmount(BigDecimal.ZERO)
                        .build();

                PurchaseOrderItem poi1 = PurchaseOrderItem.builder()
                        .purchaseOrder(po)
                        .productDetail(dBeef)
                        .quantity(20.0)
                        .unitPrice(new BigDecimal("240000"))
                        .totalPrice(new BigDecimal("4800000"))
                        .note("Thịt bò tươi đạt chuẩn VSATTP")
                        .build();

                PurchaseOrderItem poi2 = PurchaseOrderItem.builder()
                        .purchaseOrder(po)
                        .productDetail(dShrimp)
                        .quantity(15.0)
                        .unitPrice(new BigDecimal("270000"))
                        .totalPrice(new BigDecimal("4050000"))
                        .note("Tôm sú sống oxy tươi mới")
                        .build();

                PurchaseOrderItem poi3 = PurchaseOrderItem.builder()
                        .purchaseOrder(po)
                        .productDetail(dRice)
                        .quantity(100.0)
                        .unitPrice(new BigDecimal("18000"))
                        .totalPrice(new BigDecimal("1800000"))
                        .note("Bao 25kg nguyên đai nguyên kiện")
                        .build();

                BigDecimal total = poi1.getTotalPrice().add(poi2.getTotalPrice()).add(poi3.getTotalPrice());
                po.setTotalAmount(total);
                po.getItems().addAll(List.of(poi1, poi2, poi3));

                purchaseOrderRepository.save(po);
                log.info("Phiếu nhập kho ban đầu tạo thành công với tổng tiền: {}", total);
            }

            log.info("Seeding SPCT, TPSP and Purchase Orders completed successfully!");
        }
    }
}
