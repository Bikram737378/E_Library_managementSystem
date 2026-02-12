import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MyBooks = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const { data } = await api.get('/loans/my-loans');
      setLoans(data.data.loans);
    } catch (error) {
      toast.error('Failed to load your books');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Books - Smart Library</title>
      </Helmet>

      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Borrowed Books</h1>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {loans.map((loan) => (
              <li key={loan._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {loan.book.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      by {loan.book.author}
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Issued:</span>{' '}
                        {new Date(loan.issueDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="text-gray-500">Due:</span>{' '}
                        {new Date(loan.dueDate).toLocaleDateString()}
                      </div>
                      {loan.returnDate && (
                        <div>
                          <span className="text-gray-500">Returned:</span>{' '}
                          {new Date(loan.returnDate).toLocaleDateString()}
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Status:</span>{' '}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          loan.status === 'returned'
                            ? 'bg-green-100 text-green-800'
                            : loan.status === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {loan.status}
                        </span>
                      </div>
                    </div>
                    {loan.fineAmount > 0 && (
                      <div className="mt-2 text-sm font-medium text-red-600">
                        Fine: ₹{loan.fineAmount}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default MyBooks;