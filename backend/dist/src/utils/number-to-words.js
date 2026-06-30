"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.numberToWords = numberToWords;
function numberToWords(amount) {
    if (amount === 0)
        return 'Zero Rupees Only';
    const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const doubleDigits = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tensMultiple = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    // Splitting into integer and paisa
    const roundedAmount = Math.round(amount * 100) / 100;
    const parts = roundedAmount.toString().split('.');
    const wholeNumber = parseInt(parts[0], 10);
    const paisaNumber = parts[1] ? parseInt(parts[1].padEnd(2, '0').substring(0, 2), 10) : 0;
    function convertWhole(num) {
        if (num === 0)
            return '';
        let result = '';
        // Handle Crores (1,00,00,000)
        const crore = Math.floor(num / 10000000);
        let remaining = num % 10000000;
        if (crore > 0) {
            result += convertHundreds(crore) + ' Crore ';
        }
        // Handle Lakhs (1,00,000)
        const lakh = Math.floor(remaining / 100000);
        remaining = remaining % 100000;
        if (lakh > 0) {
            result += convertHundreds(lakh) + ' Lakh ';
        }
        // Handle Thousands (1,000)
        const thousand = Math.floor(remaining / 1000);
        remaining = remaining % 1000;
        if (thousand > 0) {
            result += convertHundreds(thousand) + ' Thousand ';
        }
        // Handle Hundreds
        if (remaining > 0) {
            result += convertHundreds(remaining);
        }
        return result.trim();
    }
    function convertHundreds(num) {
        let str = '';
        if (num >= 100) {
            str += singleDigits[Math.floor(num / 100)] + ' Hundred ';
            num %= 100;
        }
        if (num > 0) {
            if (num < 10) {
                str += singleDigits[num];
            }
            else if (num < 20) {
                str += doubleDigits[num - 10];
            }
            else {
                str += tensMultiple[Math.floor(num / 10)] + ' ' + singleDigits[num % 10];
            }
        }
        return str.trim();
    }
    let words = convertWhole(wholeNumber);
    if (!words)
        words = 'Zero';
    words += ' Rupees';
    if (paisaNumber > 0) {
        let paisaWords = '';
        if (paisaNumber < 10) {
            paisaWords = singleDigits[paisaNumber];
        }
        else if (paisaNumber < 20) {
            paisaWords = doubleDigits[paisaNumber - 10];
        }
        else {
            paisaWords = tensMultiple[Math.floor(paisaNumber / 10)] + ' ' + singleDigits[paisaNumber % 10];
        }
        words += ` and ${paisaWords.trim()} Paisa`;
    }
    return words + ' Only';
}
