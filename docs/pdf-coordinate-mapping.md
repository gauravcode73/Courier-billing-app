# PDF Coordinate Mapping Guide

This guide explains the coordinate layout system used by `pdf-lib` to overlay text fields onto the courier bill template and remove the GST and Signature sections.

---

## 1. Coordinates System Concept

In `pdf-lib`, page coordinates differ from CSS pixels:
- **Origin (0,0)**: The bottom-left corner of the page.
- **Unit**: Points (1 inch = 72 points).
- **A4 Dimensions**: `595` points width by `842` points height.
- **Direction**: Increasing `x` moves right; increasing `y` moves up.

---

## 2. Text Overlay Coordinate Map

The following coordinate positions are mapped inside `backend/src/services/pdf.service.ts`:

| Variable Field | X Coordinate | Y Coordinate | Font Size | Styling |
| :--- | :---: | :---: | :---: | :---: |
| **Book Number** | 85 | 715 | 10 | Bold |
| **Consignment Number** | 295 | 715 | 10 | Bold |
| **Booking Date** | 418 | 715 | 9 | Normal |
| **Booking Time** | 525 | 715 | 9 | Normal |
| **Booking Type** | 110 | 675 | 9 | Bold |
| **Booking Mode** | 280 | 675 | 9 | Bold |
| **Product Type** | 450 | 675 | 9 | Bold |
| **Sender Name** | 65 | 615 | 9 | Bold |
| **Sender Address Line 1** | 92 | 590 | 8.5 | Normal |
| **Sender Address Line 2** | 92 | 565 | 8.5 | Normal |
| **Sender City** | 65 | 540 | 9 | Normal |
| **Sender State** | 205 | 540 | 9 | Normal |
| **Sender Pincode** | 80 | 515 | 9 | Normal |
| **Sender Mobile** | 198 | 515 | 9 | Bold |
| **Receiver Name** | 350 | 615 | 9 | Bold |
| **Receiver Address Line 1** | 375 | 590 | 8.5 | Normal |
| **Receiver Address Line 2** | 375 | 565 | 8.5 | Normal |
| **Receiver City** | 348 | 540 | 9 | Normal |
| **Receiver State** | 485 | 540 | 9 | Normal |
| **Receiver Pincode** | 363 | 515 | 9 | Normal |
| **Receiver Mobile** | 482 | 515 | 9 | Bold |
| **Articles Count** | 80 | 425 | 10 | Bold |
| **Actual Weight** | 180 | 425 | 9 | Normal |
| **Length (cm)** | 252 | 425 | 9 | Normal |
| **Width (cm)** | 322 | 425 | 9 | Normal |
| **Height (cm)** | 392 | 425 | 9 | Normal |
| **Volumetric Weight** | 110 | 400 | 9 | Normal |
| **Chargeable Weight** | 260 | 400 | 10 | Bold |
| **Goods Description** | 140 | 375 | 9 | Normal |
| **Remarks** | 80 | 345 | 9 | Normal |
| **Payment Mode** | 110 | 322 | 10 | Bold |
| **Freight Charges** | 140 | 260 | 9.5 | Normal |
| **Handling Charges** | 140 | 240 | 9.5 | Normal |
| **Other Charges** | 140 | 220 | 9.5 | Normal |
| **Insurance Amount** | 140 | 200 | 9.5 | Normal |
| **Grand Total** | 140 | 172 | 11 | Bold |
| **Grand Total in Words** | 120 | 150 | 8.5 | Normal |

---

## 3. White-Out Masking Coordinates (Removals)

The application hides the GST tax table and signatures by drawing solid white rectangles over those specific regions before overlaying new text.

### GST Box Mask
- **Region**: Bottom right corner, containing tax grids.
- **Coordinates**: `x = 348`, `y = 198`
- **Dimensions**: `width = 228`, `height = 104`
- **Effect**: Hides CGST, SGST, IGST labels and values.

### Signatures Box Mask
- **Region**: The bottom margin of the page.
- **Coordinates**: `x = 18`, `y = 18`
- **Dimensions**: `width = 559`, `height = 64`
- **Effect**: Hides Sender Signature, Company Signature, Authorized Signatory lines, ensuring the document layout ends cleanly after the Terms & Conditions block.

---

## 4. Re-Aligning for Custom PDF Templates

If your physical printed template differs slightly in layout:
1. Open the template in a design program (e.g. Figma or Illustrator) set to A4 dimensions (595 x 842 points).
2. Measure the distance in points from the **bottom edge** (y-axis) and **left edge** (x-axis) to the start of each blank box.
3. Edit the numbers inside `backend/src/services/pdf.service.ts` in the `fillTemplate` function.
4. Restart the server or hit reprint to verify alignment.
