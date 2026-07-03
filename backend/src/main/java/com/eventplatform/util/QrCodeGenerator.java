package com.eventplatform.util;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import java.io.ByteArrayOutputStream;
import java.util.Base64;

// Utility class to generate QR codes as Base64-encoded strings.
public class QrCodeGenerator {

    // Generates a QR Code image for the given text, saves it as a PNG, and converts it to a Base64 string.
    // - text: The content to pack inside the QR code (e.g. "REG-1783093119965-998").
    // - width / height: Size parameters of the generated QR code square.
    public static String generateQrCodeBase64(String text, int width, int height) {
        try {
            // Instantiate ZXing's core QRCodeWriter
            QRCodeWriter qrCodeWriter = new QRCodeWriter();

            // Encode the text into a 2D BitMatrix representing the QR code blocks (black/white dots)
            BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);

            // Create a byte array stream to hold the PNG image data
            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();

            // Write the BitMatrix to the stream as a PNG image
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);

            // Retrieve the raw bytes of the generated PNG image
            byte[] pngBytes = pngOutputStream.toByteArray();

            // Encode the PNG byte array into a standard Base64 string.
            // This allows the frontend to render the image directly inside an <img> tag without downloading a separate file!
            return Base64.getEncoder().encodeToString(pngBytes);

        } catch (Exception e) {
            System.err.println("QR Code Generation failed: " + e.getMessage());
            return null; // Return null if generation fails
        }
    }
}
