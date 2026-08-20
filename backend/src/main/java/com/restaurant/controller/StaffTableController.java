package com.restaurant.controller;

import com.restaurant.dto.response.TableResponse;
import com.restaurant.enums.TableStatus;
import com.restaurant.service.TableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff/tables")
@RequiredArgsConstructor
public class StaffTableController {

    private final TableService tableService;

    @GetMapping
    public ResponseEntity<List<TableResponse>> getAllTables() {
        List<TableResponse> tables = tableService.getAllTables();
        return ResponseEntity.ok(tables);
    }

    @PatchMapping("/{tableId}/status")
    public ResponseEntity<TableResponse> updateTableStatus(
            @PathVariable Long tableId,
            @RequestParam TableStatus status) {
        TableResponse response = tableService.updateTableStatus(tableId, status);
        return ResponseEntity.ok(response);
    }
}
