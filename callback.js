const fs = require('fs');
const path = require('path');
const moment = require('moment');

// Store transactions
const transactionsFile = path.join(__dirname, '../data/transactions.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, '../data'))) {
  fs.mkdirSync(path.join(__dirname, '../data'), { recursive: true });
}

const handleCallback = (req, res) => {
  try {
    const callbackData = req.body.Body.stkCallback;
    
    const transaction = {
      id: callbackData.CheckoutRequestID,
      phone: callbackData.PhoneNumber,
      amount: callbackData.CallbackMetadata?.Item?.[0]?.Value || 0,
      resultCode: callbackData.ResultCode,
      resultDesc: callbackData.ResultDesc,
      mpesaCode: callbackData.CallbackMetadata?.Item?.[1]?.Value || '',
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
      status: callbackData.ResultCode === 0 ? 'SUCCESS' : 'FAILED',
      items: []
    };

    // Read existing transactions
    let transactions = [];
    if (fs.existsSync(transactionsFile)) {
      transactions = JSON.parse(fs.readFileSync(transactionsFile, 'utf8'));
    }

    transactions.push(transaction);
    fs.writeFileSync(transactionsFile, JSON.stringify(transactions, null, 2));

    console.log('✅ Transaction recorded:', transaction.id);

    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('❌ Callback error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { handleCallback };
