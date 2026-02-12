import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import QRScanner from '../../components/QRScanner';
import api from '../../services/api';
import toast from 'react-hot-toast';

const IssueBook = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [bookId, setBookId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQRScan = (data) => {
    if (data.bookId) {
      setBookId(data.bookId);
      toast.success('Book QR scanned successfully');
    } else {
      toast.error('Invalid QR code format');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!studentId.trim()) {
      toast.error('Please enter Student ID');
      return;
    }
    
    if (!bookId.trim()) {
      toast.error('Please enter or scan Book ID');
      return;
    }

    setLoading(true);

    try {
      console.log('📚 Issuing book:', { bookId, studentId, dueDate });
      
      const response = await api.post('/loans', {
        bookId,
        studentId,
        dueDate: dueDate || undefined
      });

      console.log('✅ Issue response:', response.data);
      
      toast.success('Book issued successfully!');
      
      // Clear form
      setStudentId('');
      setBookId('');
      setDueDate('');
      
    } catch (error) {
      console.error('❌ Issue error:', error.response || error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to issue book';
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Issue Book - Smart Library</title>
      </Helmet>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Issue Book</h1>

        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student ID
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter student ID (e.g., STU001)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Book ID
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={bookId}
                  onChange={(e) => setBookId(e.target.value)}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter book ID or scan QR"
                />
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Scan QR
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Leave empty for 14 days from today
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Issuing...' : 'Issue Book'}
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

export default IssueBook;