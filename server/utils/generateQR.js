const QRCode = require('qrcode');

const generateQRCode = async (bookId, isbn, title) => {
  try {
    const qrData = JSON.stringify({
      bookId,
      isbn,
      title,
      timestamp: new Date().toISOString(),
    });
    
    const qrCode = await QRCode.toDataURL(qrData);
    return qrCode;
  } catch (error) {
    console.error('QR Generation Error:', error);
    throw error;
  }
};

module.exports = generateQRCode;