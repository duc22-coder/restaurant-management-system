package com.restaurant.controller;

import com.restaurant.dto.response.CategoryResponse;
import com.restaurant.dto.response.MenuItemResponse;
import com.restaurant.service.CategoryService;
import com.restaurant.service.MenuItemService;
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
}
