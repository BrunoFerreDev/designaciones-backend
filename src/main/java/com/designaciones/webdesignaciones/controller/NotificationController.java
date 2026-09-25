package com.designaciones.webdesignaciones.controller;

import com.designaciones.webdesignaciones.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PreAuthorize("isAuthenticated()")
    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe() {
        return notificationService.subscribe();
    }
}
