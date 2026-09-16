package com.restaurant.service;

import com.restaurant.dto.request.TableRequest;
import com.restaurant.dto.response.TableResponse;
import com.restaurant.enums.TableStatus;

import java.util.List;

public interface TableService {
    List<TableResponse> getAllTables();
    TableResponse getTableById(Long id);
    TableResponse updateTableStatus(Long id, TableStatus status);
    TableResponse createTable(TableRequest request);
    TableResponse updateTable(Long id, TableRequest request);
    void deleteTable(Long id);
}
