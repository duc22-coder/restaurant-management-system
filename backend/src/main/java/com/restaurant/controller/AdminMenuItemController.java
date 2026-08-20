package com.restaurant.controller;

import com.restaurant.dto.request.MenuItemRequest;
import com.restaurant.dto.response.MenuItemResponse;
import com.restaurant.service.MenuItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/menu")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminMenuItemController {

    private final MenuItemService menuItemService;

    @GetMapping
    public ResponseEntity<List<MenuItemResponse>> getAllMenuItems() {
        return ResponseEntity.ok(menuItemService.getAllMenuItems());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MenuItemResponse> getMenuItemById(@PathVariable Long id) {
        return ResponseEntity.ok(menuItemService.getMenuItemById(id));
    }

    @PostMapping
    public ResponseEntity<MenuItemResponse> createMenuItem(@Valid @RequestBody MenuItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(menuItemService.createMenuItem(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MenuItemResponse> updateMenuItem(@PathVariable Long id, @Valid @RequestBody MenuItemRequest request) {
        return ResponseEntity.ok(menuItemService.updateMenuItem(id, request));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<MenuItemResponse> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(menuItemService.toggleStatus(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long id) {
        menuItemService.deleteMenuItem(id);
        return ResponseEntity.noContent().build();
    }
}
