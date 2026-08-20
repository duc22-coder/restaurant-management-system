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

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedUsers();
        seedTables();
        seedCategoriesAndMenuItems();
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
}
