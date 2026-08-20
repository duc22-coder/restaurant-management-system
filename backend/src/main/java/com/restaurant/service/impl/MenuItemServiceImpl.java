package com.restaurant.service.impl;

import com.restaurant.dto.request.MenuItemRequest;
import com.restaurant.dto.response.MenuItemResponse;
import com.restaurant.entity.Category;
import com.restaurant.entity.MenuItem;
import com.restaurant.enums.MenuItemStatus;
import com.restaurant.repository.CategoryRepository;
import com.restaurant.repository.MenuItemRepository;
import com.restaurant.service.MenuItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuItemServiceImpl implements MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MenuItemResponse> getAllMenuItems() {
        return menuItemRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MenuItemResponse> getCustomerMenuItems(Long categoryId, String search) {
        List<MenuItem> items;

        if (StringUtils.hasText(search)) {
            items = menuItemRepository.searchByNameAndStatus(search.trim(), MenuItemStatus.AVAILABLE);
            if (categoryId != null) {
                items = items.stream()
                        .filter(item -> item.getCategory().getId().equals(categoryId))
                        .collect(Collectors.toList());
            }
        } else if (categoryId != null) {
            items = menuItemRepository.findByCategoryIdAndStatus(categoryId, MenuItemStatus.AVAILABLE);
        } else {
            items = menuItemRepository.findByStatus(MenuItemStatus.AVAILABLE);
        }

        return items.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MenuItemResponse getMenuItemById(Long id) {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy món ăn với ID: " + id));
        return mapToResponse(menuItem);
    }


    @Override
    @Transactional
    public MenuItemResponse createMenuItem(MenuItemRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với ID: " + request.getCategoryId()));

        MenuItem menuItem = MenuItem.builder()
                .category(category)
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .image(request.getImage())
                .status(request.getStatus() != null ? request.getStatus() : MenuItemStatus.AVAILABLE)
                .build();

        MenuItem savedMenuItem = menuItemRepository.save(menuItem);
        return mapToResponse(savedMenuItem);
    }

    @Override
    @Transactional
    public MenuItemResponse updateMenuItem(Long id, MenuItemRequest request) {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy món ăn với ID: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với ID: " + request.getCategoryId()));

        menuItem.setCategory(category);
        menuItem.setName(request.getName());
        menuItem.setDescription(request.getDescription());
        menuItem.setPrice(request.getPrice());
        menuItem.setImage(request.getImage());
        if (request.getStatus() != null) {
            menuItem.setStatus(request.getStatus());
        }

        MenuItem updatedMenuItem = menuItemRepository.save(menuItem);
        return mapToResponse(updatedMenuItem);
    }

    @Override
    @Transactional
    public MenuItemResponse toggleStatus(Long id) {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy món ăn với ID: " + id));

        menuItem.setStatus(menuItem.getStatus() == MenuItemStatus.AVAILABLE ?
                MenuItemStatus.UNAVAILABLE : MenuItemStatus.AVAILABLE);

        MenuItem updatedMenuItem = menuItemRepository.save(menuItem);
        return mapToResponse(updatedMenuItem);
    }

    @Override
    @Transactional
    public void deleteMenuItem(Long id) {
        if (!menuItemRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy món ăn để xóa với ID: " + id);
        }
        menuItemRepository.deleteById(id);
    }

    private MenuItemResponse mapToResponse(MenuItem menuItem) {
        return MenuItemResponse.builder()
                .id(menuItem.getId())
                .categoryId(menuItem.getCategory().getId())
                .categoryName(menuItem.getCategory().getName())
                .name(menuItem.getName())
                .description(menuItem.getDescription())
                .price(menuItem.getPrice())
                .image(menuItem.getImage())
                .status(menuItem.getStatus())
                .createdAt(menuItem.getCreatedAt())
                .build();
    }
}
