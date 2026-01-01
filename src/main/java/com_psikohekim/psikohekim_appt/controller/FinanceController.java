package com.psikohekim.psikohekim_appt.controller;

import com.psikohekim.psikohekim_appt.service.FinanceService;
import com.psikohekim.psikohekim_appt.model.TherapySession; // Repository eklendiğinde buradan çekilecek
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList; // Mock veri için
import java.util.List;

@RestController
@RequestMapping("/api/finance")
public class FinanceController {

    @Autowired
    private FinanceService financeService;

    // Gerçek uygulamada Repository @Autowired edilmeli
    
    @GetMapping("/monthly-report")
    public FinanceReport getMonthlyReport(@RequestParam int year, @RequestParam int month) {
        // Mock veri kaynağı (Gerçekte DB'den gelecek)
        List<TherapySession> allSessions = new ArrayList<>(); 
        
        return financeService.calculateMonthlyReport(allSessions, year, month);
    }
}
