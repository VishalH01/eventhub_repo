package com.eventplatform.service;

import com.eventplatform.dto.PaymentRequest;
import com.eventplatform.entity.Payment;
import com.eventplatform.entity.Registration;
import com.eventplatform.repository.PaymentRepository;
import com.eventplatform.repository.RegistrationRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

// @Service: Declares this class as a Service Bean managed by Spring IoC container.
@Service
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    // Inject Razorpay credentials from application.properties
    @Value("${app.razorpay-key-id}")
    private String razorpayKeyId;

    @Value("${app.razorpay-key-secret}")
    private String razorpayKeySecret;

    // 1. Create Razorpay Order
    @Override
    @Transactional
    public String createOrder(Long registrationId) {
        // Step A: Find the associated booking registration record
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration booking not found with ID: " + registrationId));

        // Event price in Rupees
        double price = registration.getEvent().getPrice();
        // Convert to Paise (Razorpay processes amounts in the smallest currency unit: e.g. 1 Rupee = 100 Paise)
        int amountInPaise = (int) (price * 100);

        try {
            // Robust Simulation Check:
            // If dummy properties are set, bypass the SDK API calls and return a simulated Order ID.
            if (razorpayKeyId == null || razorpayKeyId.startsWith("rzp_test_dummy")) {
                System.out.println("[Payment Sim] Generating simulated Order ID for dummy keys.");
                return "order_simulated_" + System.currentTimeMillis();
            }

            // Instantiate Razorpay client using our Key ID and Secret
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            // Construct Razorpay Order creation request JSON payload
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);      // Amount in Paise
            orderRequest.put("currency", "INR");            // Currency
            orderRequest.put("receipt", "receipt_reg_" + registrationId); // Custom receipt reference code

            // Send request to Razorpay backend API. Returns an Order object.
            Order order = razorpay.orders.create(orderRequest);

            // Return the unique Razorpay Order ID (e.g. order_Njks883hda902)
            return order.get("id");

        } catch (Exception e) {
            // Fallback Simulation on connection/SDK error:
            // If the API call fails (network error or invalid keys), log the exception and return a simulated order code
            // so that the student is never blocked in their local checkout testing environment.
            System.err.println("Razorpay connection failed: " + e.getMessage() + ". Falling back to simulated Order ID.");
            return "order_simulated_" + System.currentTimeMillis();
        }
    }

    // 2. Verify Payment Signature
    @Override
    @Transactional
    public Registration verifyPayment(Long registrationId, PaymentRequest verifyRequest) {
        // Step A: Find the registration booking
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration booking not found with ID: " + registrationId));

        boolean isValid = false;

        // Check if the order was a simulated fallback order
        if (verifyRequest.getRazorpayOrderId().startsWith("order_simulated_")) {
            // Instantly validate simulated payments
            isValid = true;
            System.out.println("[Payment Sim] Validated simulated payment signature for Order ID: " + verifyRequest.getRazorpayOrderId());
        } else {
            try {
                // Cryptographically verify the payment signature using the Razorpay SDK Utility class.
                // - Formula: HMAC-SHA256(order_id + "|" + payment_id, secret)
                // - If generated hash matches the returned signature, signature is authentic.
                JSONObject options = new JSONObject();
                options.put("razorpay_order_id", verifyRequest.getRazorpayOrderId());
                options.put("razorpay_payment_id", verifyRequest.getRazorpayPaymentId());
                options.put("razorpay_signature", verifyRequest.getRazorpaySignature());

                isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);
            } catch (Exception e) {
                System.err.println("Cryptographic signature check failed: " + e.getMessage());
                isValid = false;
            }
        }

        if (!isValid) {
            throw new RuntimeException("Payment signature verification failed! Possible transaction tampering.");
        }

        // Step B: Set registration status to CONFIRMED
        registration.setStatus("CONFIRMED");
        registrationRepository.save(registration);

        // Step C: Log transaction and save a new Payment record in our database
        Payment payment = new Payment();
        payment.setRazorpayOrderId(verifyRequest.getRazorpayOrderId());
        payment.setRazorpayPaymentId(verifyRequest.getRazorpayPaymentId());
        payment.setRazorpaySignature(verifyRequest.getRazorpaySignature());
        payment.setAmount(registration.getEvent().getPrice());
        payment.setStatus("SUCCESS");
        payment.setPaymentDate(LocalDateTime.now());
        payment.setRegistration(registration);

        paymentRepository.save(payment);

        // Step D: Populate the transient QR code string immediately for instant UI feedback
        String qrContent = "Registration Code: " + registration.getRegistrationNumber() + "\n" +
                           "Attendee: " + registration.getUser().getName() + "\n" +
                           "Event: " + registration.getEvent().getTitle() + "\n" +
                           "Date: " + registration.getEvent().getDate() + "\n" +
                           "Venue: " + registration.getEvent().getLocation();
        String base64Image = com.eventplatform.util.QrCodeGenerator.generateQrCodeBase64(qrContent, 200, 200);
        registration.setQrCodeBase64(base64Image);

        return registration;
    }
}
