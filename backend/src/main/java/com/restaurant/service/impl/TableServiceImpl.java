package com.restaurant.service.impl;

import com.restaurant.dto.request.TableRequest;
import com.restaurant.dto.response.TableResponse;
import com.restaurant.entity.Order;
import com.restaurant.entity.RestaurantTable;
import com.restaurant.enums.TableStatus;
import com.restaurant.repository.OrderRepository;
import com.restaurant.repository.RestaurantTableRepository;
import com.restaurant.service.TableService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TableServiceImpl implements TableService {

    private final RestaurantTableRepository tableRepository;
    private final OrderRepository orderRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TableResponse> getAllTables() {
        return tableRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TableResponse getTableById(Long id) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bàn với ID: " + id));
        return mapToResponse(table);
    }

    @Override
    @Transactional
    public TableResponse updateTableStatus(Long id, TableStatus status) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bàn với ID: " + id));
        table.setStatus(status);
        RestaurantTable updated = tableRepository.save(table);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public TableResponse createTable(TableRequest request) {
        if (Boolean.TRUE.equals(tableRepository.existsByTableNumber(request.getTableNumber()))) {
            throw new RuntimeException("Số bàn '" + request.getTableNumber() + "' đã tồn tại!");
        }

        RestaurantTable table = RestaurantTable.builder()
                .tableNumber(request.getTableNumber())
                .capacity(request.getCapacity())
                .status(request.getStatus() != null ? request.getStatus() : TableStatus.AVAILABLE)
                .build();
        // Sinh QR Code trỏ tới trang menu công khai kèm ID bàn (được gán sau khi lưu để có ID)
        RestaurantTable saved = tableRepository.save(table);
        saved.setQrCode("/menu?tableId=" + saved.getId());
        RestaurantTable updated = tableRepository.save(saved);

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public TableResponse updateTable(Long id, TableRequest request) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bàn với ID: " + id));

        if (!table.getTableNumber().equals(request.getTableNumber())
                && Boolean.TRUE.equals(tableRepository.existsByTableNumber(request.getTableNumber()))) {
            throw new RuntimeException("Số bàn '" + request.getTableNumber() + "' đã tồn tại!");
        }

        table.setTableNumber(request.getTableNumber());
        table.setCapacity(request.getCapacity());
        if (request.getStatus() != null) {
            table.setStatus(request.getStatus());
        }

        RestaurantTable updated = tableRepository.save(table);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteTable(Long id) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bàn với ID: " + id));

        List<Order> activeOrders = orderRepository.findActiveOrdersByTableId(id);
        if (!activeOrders.isEmpty()) {
            throw new RuntimeException("Không thể xóa bàn đang có đơn hàng chưa hoàn tất!");
        }

        tableRepository.delete(table);
    }

    private TableResponse mapToResponse(RestaurantTable table) {
        List<Order> activeOrders = orderRepository.findActiveOrdersByTableId(table.getId());
        Order activeOrder = activeOrders.isEmpty() ? null : activeOrders.get(0);

        return TableResponse.builder()
                .id(table.getId())
                .tableNumber(table.getTableNumber())
                .capacity(table.getCapacity())
                .status(table.getStatus())
                .qrCode(table.getQrCode())
                .activeOrderId(activeOrder != null ? activeOrder.getId() : null)
                .activeOrderCode(activeOrder != null ? activeOrder.getOrderCode() : null)
                .build();
    }
}
