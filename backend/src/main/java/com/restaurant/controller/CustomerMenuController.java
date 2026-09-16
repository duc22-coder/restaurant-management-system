package com.restaurant.controller;

import com.restaurant.dto.response.CategoryResponse;
import com.restaurant.dto.response.MenuItemResponse;
import com.restaurant.dto.response.TableResponse;
import com.restaurant.service.CategoryService;
import com.restaurant.service.MenuItemService;
import com.restaurant.service.TableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerMenuController {

    private final CategoryService categoryService;
    private final MenuItemService menuItemService;
    private final TableService tableService;

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> getActiveCategories() {
        return ResponseEntity.ok(categoryService.getActiveCategories());
    }

    @GetMapping("/menu")
    public ResponseEntity<List<MenuItemResponse>> getCustomerMenu(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(menuItemService.getCustomerMenuItems(categoryId, search));
    }

    @GetMapping("/menu/{id}")
    public ResponseEntity<MenuItemResponse> getMenuItemById(@PathVariable Long id) {
        return ResponseEntity.ok(menuItemService.getMenuItemById(id));
    }

    // Danh sách bàn công khai để Customer tự chọn/nhập số bàn khi đặt "Ăn tại bàn" mà không quét QR
    @GetMapping("/tables")
    public ResponseEntity<List<TableResponse>> getAvailableTables() {
        return ResponseEntity.ok(tableService.getAllTables());
    }
}
