package com.restaurant.service;

import com.restaurant.dto.request.MenuItemRequest;
import com.restaurant.dto.response.MenuItemResponse;

import java.util.List;

public interface MenuItemService {

    List<MenuItemResponse> getAllMenuItems();

    List<MenuItemResponse> getCustomerMenuItems(Long categoryId, String search);

    MenuItemResponse getMenuItemById(Long id);

    MenuItemResponse createMenuItem(MenuItemRequest request);

    MenuItemResponse updateMenuItem(Long id, MenuItemRequest request);

    MenuItemResponse toggleStatus(Long id);

    void deleteMenuItem(Long id);
}
