import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import QRScanner from '../../components/QRScanner';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ReturnBook = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [loanId, setLoanId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQRScan = (data) => {
    // Assume QR contains loan ID or book ID - you may need to adapt
    setLoanId(data.loanId || data.bookId);
    toast.success('QR scanned successfully');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/loans/${loanId}/return`);
      toast.success('Book returned successfully');
      setLoanId('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to return book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Return Book - Smart Library</title>
      </Helmet>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Return Book</h1>

        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan ID / Book ID
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={loanId}
                  onChange={(e) => setLoanId(e.target.value)}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter loan ID or scan QR"
                />
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Scan QR
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Return Book'}
            </button>
          </form>
        </div>
      </div>

      {showScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
};

export default ReturnBook;