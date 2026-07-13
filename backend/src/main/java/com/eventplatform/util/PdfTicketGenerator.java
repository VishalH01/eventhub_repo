package com.eventplatform.util;

import com.eventplatform.entity.Registration;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.*;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.stream.Collectors;

public class PdfTicketGenerator {

    public static byte[] generateTicketPdf(Registration reg) {
        return generateTicketPdf(reg, null, null, 0.0);
    }

    public static byte[] generateTicketPdf(Registration reg, String attendeeName, String seatCode, double ticketPrice) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            // Setup document with custom landscape ticket size (800x300) and zero margins
            Document document = new Document(new Rectangle(800, 300), 0, 0, 0, 0);
            PdfWriter writer = PdfWriter.getInstance(document, baos);
            document.open();

            // Font configurations
            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD, new Color(30, 41, 59)); // Slate 800
            Font catFont = new Font(Font.HELVETICA, 9, Font.BOLD, new Color(148, 163, 184)); // Slate 400
            Font boldLabel = new Font(Font.HELVETICA, 8, Font.BOLD, new Color(148, 163, 184)); // Slate 400
            Font boldValue = new Font(Font.HELVETICA, 11, Font.BOLD, new Color(30, 41, 59));  // Slate 800
            Font valueVip = new Font(Font.HELVETICA, 11, Font.BOLD, new Color(79, 70, 229));  // Indigo 600
            Font infoText = new Font(Font.HELVETICA, 10, Font.BOLD, new Color(71, 85, 105)); // Slate 600
            
            Font whiteLabel = new Font(Font.HELVETICA, 7, Font.BOLD, new Color(148, 163, 184)); // Slate 400
            Font whiteValue = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);
            Font greenValue = new Font(Font.HELVETICA, 10, Font.BOLD, new Color(52, 211, 153)); // Emerald 400
            Font footerText = new Font(Font.HELVETICA, 9, Font.NORMAL, new Color(148, 163, 184));

            // Setup ticket content calculations
            String hasSeats = seatCode != null ? seatCode : (reg.getSeats() != null && !reg.getSeats().trim().isEmpty() ? reg.getSeats() : "");
            String[] seatList = !hasSeats.isEmpty() ? hasSeats.split(",") : new String[0];
            int seatCount = Math.max(1, seatList.length);
            
            String gateVal = "G" + ((reg.getId() % 3) + 1);
            
            String rowVal = "";
            if (seatList.length > 0) {
                rowVal = java.util.Arrays.stream(seatList)
                        .map(s -> s.split("-")[0].trim())
                        .distinct()
                        .collect(Collectors.joining(", "));
            } else {
                rowVal = String.valueOf((char)('A' + (reg.getId() % 6)));
            }
            
            String seatVal = "";
            if (seatList.length > 0) {
                seatVal = java.util.Arrays.stream(seatList)
                        .map(s -> s.split("-")[1].trim())
                        .collect(Collectors.joining(", "));
            } else {
                seatVal = String.valueOf(((reg.getId() * 13) % 45) + 1);
            }
            
            String ticketTypeVal = reg.getEvent().getPrice() > 499 ? "VIP" : "GENERAL";
            double totalPaidPrice = ticketPrice > 0.0 ? ticketPrice : reg.getEvent().getPrice() * seatCount;

            // Main Table (Left 70% column and Right 30% column)
            PdfPTable mainTable = new PdfPTable(new float[]{7f, 3f});
            mainTable.setWidthPercentage(100);

            // Left Cell (Details)
            PdfPCell leftCell = new PdfPCell();
            leftCell.setBorder(Rectangle.NO_BORDER);
            leftCell.setPadding(0);

            // Inner table for Left Section to support the bottom dark bar perfectly
            PdfPTable innerLeftTable = new PdfPTable(1);
            innerLeftTable.setWidthPercentage(100);

            // Left Content Cell (Top 75% area)
            PdfPCell leftContentCell = new PdfPCell();
            leftContentCell.setBorder(Rectangle.NO_BORDER);
            leftContentCell.setPadding(20);

            // Header row with Live Event Tag & Date
            PdfPTable headerTable = new PdfPTable(new float[]{1f, 1f});
            headerTable.setWidthPercentage(100);
            
            // Tag Cell
            PdfPCell tagCell = new PdfPCell();
            tagCell.setBorder(Rectangle.NO_BORDER);
            Paragraph tagPara = new Paragraph("LIVE EVENT", new Font(Font.HELVETICA, 8, Font.BOLD, new Color(79, 70, 229)));
            tagCell.addElement(tagPara);
            headerTable.addCell(tagCell);

            // Date Cell
            PdfPCell dateCell = new PdfPCell();
            dateCell.setBorder(Rectangle.NO_BORDER);
            dateCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy  •  hh:mm a");
            String formattedDate = reg.getEvent().getDate().format(formatter);
            Paragraph datePara = new Paragraph(formattedDate, new Font(Font.HELVETICA, 9, Font.BOLD, new Color(148, 163, 184)));
            datePara.setAlignment(Element.ALIGN_RIGHT);
            dateCell.addElement(datePara);
            headerTable.addCell(dateCell);

            leftContentCell.addElement(headerTable);

            // Title & Category
            Paragraph title = new Paragraph(reg.getEvent().getTitle(), titleFont);
            title.setSpacingBefore(12);
            leftContentCell.addElement(title);

            Paragraph category = new Paragraph(reg.getEvent().getCategory().toUpperCase(), catFont);
            category.setSpacingBefore(2);
            leftContentCell.addElement(category);

            // Location
            Paragraph location = new Paragraph("📍  " + reg.getEvent().getLocation(), infoText);
            location.setSpacingBefore(8);
            leftContentCell.addElement(location);

            // Grid cards for Gate, Row, Seat, Type
            PdfPTable gridTable = new PdfPTable(4);
            gridTable.setWidthPercentage(100);
            gridTable.setSpacingBefore(16);

            addGridItem(gridTable, "GATE", gateVal, boldLabel, boldValue);
            addGridItem(gridTable, "ROW", rowVal, boldLabel, boldValue);
            addGridItem(gridTable, "SEAT", seatVal, boldLabel, boldValue);
            addGridItem(gridTable, "TYPE", ticketTypeVal, boldLabel, ticketTypeVal.equals("VIP") ? valueVip : boldValue);

            leftContentCell.addElement(gridTable);
            innerLeftTable.addCell(leftContentCell);

            // Bottom Bar Cell (Dark Slate 900)
            PdfPCell darkBarCell = new PdfPCell();
            darkBarCell.setBackgroundColor(new Color(15, 23, 42)); // Slate 900
            darkBarCell.setPaddingTop(12);
            darkBarCell.setPaddingBottom(12);
            darkBarCell.setPaddingLeft(20);
            darkBarCell.setPaddingRight(20);
            darkBarCell.setBorder(Rectangle.NO_BORDER);

            PdfPTable darkBarTable = new PdfPTable(new float[]{3.5f, 3.5f, 2.5f, 4.5f});
            darkBarTable.setWidthPercentage(100);

            addDarkBarItem(darkBarTable, "BOOKING ID", reg.getRegistrationNumber(), whiteLabel, whiteValue);
            
            DateTimeFormatter regFormatter = DateTimeFormatter.ofPattern("MMM dd, yyyy");
            String formattedRegDate = reg.getRegistrationDate().format(regFormatter);
            addDarkBarItem(darkBarTable, "BOOKING DATE", formattedRegDate, whiteLabel, whiteValue);
            
            addDarkBarItem(darkBarTable, "PRICE", "₹" + String.format("%.2f", totalPaidPrice), whiteLabel, greenValue);

            PdfPCell thankYouCell = new PdfPCell();
            thankYouCell.setBorder(Rectangle.NO_BORDER);
            thankYouCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            Paragraph tyPara = new Paragraph("Thank you for registering!", footerText);
            tyPara.setAlignment(Element.ALIGN_RIGHT);
            thankYouCell.addElement(tyPara);
            darkBarTable.addCell(thankYouCell);

            darkBarCell.addElement(darkBarTable);
            innerLeftTable.addCell(darkBarCell);

            leftCell.addElement(innerLeftTable);
            mainTable.addCell(leftCell);

            // Right Cell (Admit One & QR Section)
            PdfPCell rightCell = new PdfPCell();
            rightCell.setPadding(20);
            rightCell.setBackgroundColor(new Color(248, 250, 252)); // Slate 50
            // Set left border divider style
            rightCell.setBorder(Rectangle.LEFT);
            rightCell.setBorderWidthLeft(1.5f);
            rightCell.setBorderColorLeft(new Color(226, 232, 240)); // Slate 200

            // Admit One Label
            Paragraph admitOne = new Paragraph("ADMIT ONE", new Font(Font.HELVETICA, 8, Font.BOLD, new Color(148, 163, 184)));
            admitOne.setAlignment(Element.ALIGN_CENTER);
            rightCell.addElement(admitOne);

            // QR code container
            String qrBase64 = null;
            if (attendeeName != null) {
                String qrContent = "Registration Code: " + reg.getRegistrationNumber() + "\n" +
                                   "Attendee: " + attendeeName + "\n" +
                                   "Event: " + reg.getEvent().getTitle() + "\n" +
                                   "Date: " + reg.getEvent().getDate() + "\n" +
                                   "Venue: " + reg.getEvent().getLocation() + "\n" +
                                   "Seat: " + seatCode;
                qrBase64 = QrCodeGenerator.generateQrCodeBase64(qrContent, 200, 200);
            } else {
                qrBase64 = reg.getQrCodeBase64();
            }
            if (qrBase64 == null || qrBase64.isEmpty()) {
                String qrContent = "REG-" + reg.getRegistrationNumber();
                qrBase64 = QrCodeGenerator.generateQrCodeBase64(qrContent, 200, 200);
            }
            byte[] qrBytes = Base64.getDecoder().decode(qrBase64);
            Image qrImage = Image.getInstance(qrBytes);
            qrImage.scaleAbsolute(100, 100);
            qrImage.setAlignment(Element.ALIGN_CENTER);
            
            // White background frame for QR code
            PdfPTable qrTable = new PdfPTable(1);
            qrTable.setWidthPercentage(70);
            qrTable.setSpacingBefore(10);
            
            PdfPCell qrCell = new PdfPCell();
            qrCell.setBackgroundColor(Color.WHITE);
            qrCell.setBorder(Rectangle.BOX);
            qrCell.setBorderWidth(1f);
            qrCell.setBorderColor(new Color(226, 232, 240)); // Slate 200
            qrCell.setPadding(6);
            qrCell.addElement(qrImage);
            qrTable.addCell(qrCell);
            rightCell.addElement(qrTable);

            // Registration ID Box
            PdfPTable regIdTable = new PdfPTable(1);
            regIdTable.setWidthPercentage(85);
            regIdTable.setSpacingBefore(12);
            
            PdfPCell regIdCell = new PdfPCell();
            regIdCell.setBackgroundColor(new Color(241, 245, 249)); // Slate 100
            regIdCell.setBorder(Rectangle.BOX);
            regIdCell.setBorderWidth(1f);
            regIdCell.setBorderColor(new Color(226, 232, 240)); // Slate 200
            regIdCell.setPadding(5);
            
            Paragraph regIdLabel = new Paragraph("REGISTRATION ID", new Font(Font.HELVETICA, 6, Font.BOLD, new Color(148, 163, 184)));
            regIdLabel.setAlignment(Element.ALIGN_CENTER);
            regIdCell.addElement(regIdLabel);
            
            Paragraph regIdVal = new Paragraph(reg.getRegistrationNumber(), new Font(Font.COURIER, 8, Font.BOLD, new Color(71, 85, 105)));
            regIdVal.setAlignment(Element.ALIGN_CENTER);
            regIdCell.addElement(regIdVal);
            
            regIdTable.addCell(regIdCell);
            rightCell.addElement(regIdTable);

            // Payment Status Indicator Badge
            String status = reg.getStatus() != null ? reg.getStatus().toUpperCase() : "PENDING";
            String badgeText = status.equals("CONFIRMED") ? "Paid" : status;
            Color badgeBg = status.equals("CONFIRMED") ? new Color(209, 250, 229) : new Color(254, 243, 199);
            Color badgeTextClr = status.equals("CONFIRMED") ? new Color(4, 120, 87) : new Color(180, 83, 9);
            
            PdfPTable badgeTable = new PdfPTable(1);
            badgeTable.setWidthPercentage(50);
            badgeTable.setSpacingBefore(8);
            
            PdfPCell badgeCell = new PdfPCell();
            badgeCell.setBackgroundColor(badgeBg);
            badgeCell.setBorder(Rectangle.BOX);
            badgeCell.setBorderWidth(1f);
            badgeCell.setBorderColor(badgeBg);
            badgeCell.setPaddingTop(3);
            badgeCell.setPaddingBottom(3);
            
            Paragraph badgePara = new Paragraph(badgeText, new Font(Font.HELVETICA, 8, Font.BOLD, badgeTextClr));
            badgePara.setAlignment(Element.ALIGN_CENTER);
            badgeCell.addElement(badgePara);
            
            badgeTable.addCell(badgeCell);
            rightCell.addElement(badgeTable);

            mainTable.addCell(rightCell);
            document.add(mainTable);

            // Draw circular ticket punch cutouts at the boundary line (X = 560)
            PdfContentByte cb = writer.getDirectContent();
            cb.setColorFill(new Color(248, 250, 252)); // Slate 50 background color
            
            // Top cutout circle
            cb.circle(560, 300, 12);
            cb.fill();
            
            // Bottom cutout circle
            cb.circle(560, 0, 12);
            cb.fill();

            document.close();

            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF Ticket", e);
        }
    }

    private static void addGridItem(PdfPTable table, String label, String value, Font labelFont, Font valFont) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(Color.WHITE);
        cell.setBorder(Rectangle.BOX);
        cell.setBorderWidth(1f);
        cell.setBorderColor(new Color(241, 245, 249)); // Slate 100
        cell.setPadding(8);
        
        Paragraph lPara = new Paragraph(label, labelFont);
        Paragraph vPara = new Paragraph(value, valFont);
        vPara.setSpacingBefore(2);
        
        cell.addElement(lPara);
        cell.addElement(vPara);
        table.addCell(cell);
    }

    private static void addDarkBarItem(PdfPTable table, String label, String value, Font labelFont, Font valFont) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        
        Paragraph lPara = new Paragraph(label, labelFont);
        Paragraph vPara = new Paragraph(value, valFont);
        vPara.setSpacingBefore(1);
        
        cell.addElement(lPara);
        cell.addElement(vPara);
        table.addCell(cell);
    }
}
