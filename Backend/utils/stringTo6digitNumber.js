import crypto from 'crypto';

function stringTo6DigitNumber(str) {
    // Hash the string using SHA-256
    const hash = crypto.createHash('sha256').update(str).digest('hex');

    // Convert the first 6 characters of the hash into an integer
    const num = parseInt(hash.substring(0, 6), 16); // Base 16 to integer

    // Ensure it's a 6-digit number (i.e., within the range of 100000 to 999999)
    return num % 900000 + 100000; // This ensures it falls within the 6-digit range
}

export default stringTo6DigitNumber;