package com.eventplatform;

import com.eventplatform.entity.Event;
import com.eventplatform.entity.Registration;
import com.eventplatform.entity.User;
import com.eventplatform.entity.Payment;
import com.eventplatform.repository.EventRepository;
import com.eventplatform.repository.RegistrationRepository;
import com.eventplatform.repository.UserRepository;
import com.eventplatform.repository.PaymentRepository;
import com.eventplatform.service.RegistrationService;
import com.eventplatform.controller.EventWaitlistController;
import java.security.Principal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class EventPlatformApplicationTests {

    @Autowired
    private EventWaitlistController eventWaitlistController;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private RegistrationService registrationService;

    @Test
    void testPaidWaitlistWorkflow() {
        // 1. Load or create users
        User user1 = userRepository.findByEmail("user@eventhub.com")
            .orElseGet(() -> {
                User u = new User();
                u.setName("User One");
                u.setEmail("user@eventhub.com");
                u.setPassword("password");
                return userRepository.save(u);
            });

        User user2 = userRepository.findByEmail("waitlist_user@eventhub.com")
            .orElseGet(() -> {
                User u = new User();
                u.setName("Waitlist Guest");
                u.setEmail("waitlist_user@eventhub.com");
                u.setPassword("password");
                return userRepository.save(u);
            });

        // 2. Create a test event with capacity 1
        Event event = new Event();
        event.setTitle("E2E Waitlist Test");
        event.setCategory("CONCERT");
        event.setDate(LocalDateTime.now().plusDays(2));
        event.setLocation("Waitlist Arena");
        event.setSeatingLayout("CENTER_AISLE");
        event.setSeatingRows(1);
        event.setSeatingCols(1);
        event.setTotalCapacity(1);
        event.setPrice(100.00);
        event.setDescription("E2E Test");
        event = eventRepository.save(event);

        // 3. Book the only seat (A-1) for user1
        Registration reg1 = registrationService.bookEvent(
            event.getId(),
            user1.getEmail(),
            List.of("A-1"),
            null,
            null
        );
        reg1.setStatus("CONFIRMED");
        
        // Mock a success payment for reg1
        Payment pay1 = new Payment();
        pay1.setAmount(100.0);
        pay1.setStatus("SUCCESS");
        pay1.setPaymentDate(LocalDateTime.now());
        pay1.setRazorpayOrderId("ORDER_REF_1");
        pay1.setRazorpayPaymentId("PAY_REF_1");
        pay1.setRazorpaySignature("SIG_REF_1");
        pay1.setRegistration(reg1);
        
        pay1 = paymentRepository.save(pay1);
        reg1.setPayment(pay1);
        reg1 = registrationRepository.save(reg1);

        // 4. Join waitlist upfront for user2
        Registration waitlistReg = registrationService.bookEvent(
            event.getId(),
            user2.getEmail(),
            List.of("Waitlist"),
            null,
            null
        );
        
        assertEquals("WAITLISTED", waitlistReg.getStatus());
        assertEquals("Waitlist", waitlistReg.getSeats());
        assertEquals(100.0, waitlistReg.getFinalPrice());

        // Mock payment verification to make it WAITLISTED_PAID
        waitlistReg.setStatus("WAITLISTED_PAID");
        Payment payWaitlist = new Payment();
        payWaitlist.setAmount(100.0);
        payWaitlist.setStatus("SUCCESS");
        payWaitlist.setPaymentDate(LocalDateTime.now());
        payWaitlist.setRazorpayOrderId("ORDER_REF_WAIT");
        payWaitlist.setRazorpayPaymentId("PAY_REF_WAIT");
        payWaitlist.setRazorpaySignature("SIG_REF_WAIT");
        payWaitlist.setRegistration(waitlistReg);

        payWaitlist = paymentRepository.save(payWaitlist);
        waitlistReg.setPayment(payWaitlist);
        waitlistReg = registrationRepository.save(waitlistReg);

        // Verify it is on the paid waitlist queue
        List<Registration> paidWaitlist = registrationRepository.findByEventIdAndStatusOrderByRegistrationDateAsc(
            event.getId(),
            "WAITLISTED_PAID"
        );
        assertEquals(1, paidWaitlist.size());
        assertEquals(user2.getId(), paidWaitlist.get(0).getUser().getId());

        // 5. Cancel user1's confirmed ticket -> Should auto-promote user2
        registrationService.cancelRegistration(reg1.getId(), user1.getEmail());

        // Verify user1's ticket is cancelled
        Registration cancelledReg1 = registrationRepository.findById(reg1.getId()).orElseThrow();
        assertEquals("CANCELLED", cancelledReg1.getStatus());

        // Verify user2's ticket has been promoted to CONFIRMED and allocated seat A-1
        Registration promotedReg = registrationRepository.findById(waitlistReg.getId()).orElseThrow();
        assertEquals("CONFIRMED", promotedReg.getStatus());
        assertEquals("A-1", promotedReg.getSeats());

        // 6. Verify manual cancellation of waitlist ticket (95% refund)
        User user3 = userRepository.findByEmail("waitlist_user3@eventhub.com")
            .orElseGet(() -> {
                User u = new User();
                u.setName("Waitlist Guest 3");
                u.setEmail("waitlist_user3@eventhub.com");
                u.setPassword("password");
                return userRepository.save(u);
            });

        Registration waitlistReg3 = registrationService.bookEvent(
            event.getId(),
            user3.getEmail(),
            List.of("Waitlist"),
            null,
            null
        );
        waitlistReg3.setStatus("WAITLISTED_PAID");
        waitlistReg3.setFinalPrice(100.0);
        
        Payment payWaitlist3 = new Payment();
        payWaitlist3.setAmount(100.0);
        payWaitlist3.setStatus("SUCCESS");
        payWaitlist3.setPaymentDate(LocalDateTime.now());
        payWaitlist3.setRazorpayOrderId("ORDER_REF_WAIT_3");
        payWaitlist3.setRazorpayPaymentId("PAY_REF_WAIT_3");
        payWaitlist3.setRazorpaySignature("SIG_REF_WAIT_3");
        payWaitlist3.setRegistration(waitlistReg3);
        
        payWaitlist3 = paymentRepository.save(payWaitlist3);
        waitlistReg3.setPayment(payWaitlist3);
        waitlistReg3 = registrationRepository.save(waitlistReg3);

        // Cancel user3's waitlist ticket -> Should refund 95%
        registrationService.cancelRegistration(waitlistReg3.getId(), user3.getEmail());
        
        Registration cancelledReg3 = registrationRepository.findById(waitlistReg3.getId()).orElseThrow();
        assertEquals("CANCELLED", cancelledReg3.getStatus());
        assertEquals("REFUNDED", cancelledReg3.getPayment().getStatus());
        
        // 7. Verify event start auto-expiration refund (100% refund)
        Registration waitlistReg4 = registrationService.bookEvent(
            event.getId(),
            user3.getEmail(),
            List.of("Waitlist"),
            null,
            null
        );
        waitlistReg4.setStatus("WAITLISTED_PAID");
        waitlistReg4.setFinalPrice(100.0);
        
        Payment payWaitlist4 = new Payment();
        payWaitlist4.setAmount(100.0);
        payWaitlist4.setStatus("SUCCESS");
        payWaitlist4.setPaymentDate(LocalDateTime.now());
        payWaitlist4.setRazorpayOrderId("ORDER_REF_WAIT_4");
        payWaitlist4.setRazorpayPaymentId("PAY_REF_WAIT_4");
        payWaitlist4.setRazorpaySignature("SIG_REF_WAIT_4");
        payWaitlist4.setRegistration(waitlistReg4);
        
        payWaitlist4 = paymentRepository.save(payWaitlist4);
        waitlistReg4.setPayment(payWaitlist4);
        waitlistReg4 = registrationRepository.save(waitlistReg4);

        // Move event date to the past
        event.setDate(LocalDateTime.now().minusHours(1));
        eventRepository.save(event);

        // Trigger global processing
        registrationService.processAllExpiredWaitlists();

        Registration expiredReg = registrationRepository.findById(waitlistReg4.getId()).orElseThrow();
        assertEquals("CANCELLED", expiredReg.getStatus());
        assertEquals("REFUNDED", expiredReg.getPayment().getStatus());
    }

    @Test
    void testLeaveWaitlistController() {
        User user = userRepository.findByEmail("waitlist_user@eventhub.com")
            .orElseGet(() -> {
                User u = new User();
                u.setName("Waitlist Guest");
                u.setEmail("waitlist_user@eventhub.com");
                u.setPassword("password");
                return userRepository.save(u);
            });

        Event event = new Event();
        event.setTitle("Waitlist Controller Test");
        event.setCategory("CONCERT");
        event.setDate(LocalDateTime.now().plusDays(2));
        event.setLocation("Waitlist Arena");
        event.setSeatingLayout("CENTER_AISLE");
        event.setSeatingRows(1);
        event.setSeatingCols(1);
        event.setTotalCapacity(1);
        event.setPrice(100.00);
        event.setDescription("Controller Test");
        event = eventRepository.save(event);

        // Join waitlist
        Principal principal = () -> "waitlist_user@eventhub.com";
        eventWaitlistController.joinWaitlist(event.getId(), principal);

        // Verify status
        List<Registration> regs = registrationRepository.findByUserEmail("waitlist_user@eventhub.com");
        assertEquals(1, regs.size());
        assertEquals("WAITLISTED", regs.get(0).getStatus());

        // Leave waitlist via controller
        org.springframework.http.ResponseEntity<?> response = eventWaitlistController.leaveWaitlist(event.getId(), principal);
        assertEquals(200, response.getStatusCode().value());

        // Verify registration status is now CANCELLED
        regs = registrationRepository.findByUserEmail("waitlist_user@eventhub.com");
        assertEquals(1, regs.size());
        assertEquals("CANCELLED", regs.get(0).getStatus());
    }
}
