import { useState } from 'react';
import { Dialog } from '@headlessui/react';

export function CallLogModal({ isOpen, onClose, onLogCall, checkinId }) {
  const [callStatus, setCallStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!callStatus) {
      alert('Please select a call outcome');
      return;
    }

    setIsSubmitting(true);
    try {
      await onLogCall(checkinId, callStatus, notes);
      setCallStatus('');
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Error logging call:', error);
      alert('Failed to log call. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
            Log Call Outcome
          </Dialog.Title>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What happened? *
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="callStatus"
                    value="attended_safe"
                    checked={callStatus === 'attended_safe'}
                    onChange={(e) => setCallStatus(e.target.value)}
                    className="h-4 w-4 text-green-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    ✓ User attended and confirmed SAFE
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="callStatus"
                    value="attended_not_safe"
                    checked={callStatus === 'attended_not_safe'}
                    onChange={(e) => setCallStatus(e.target.value)}
                    className="h-4 w-4 text-red-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    ! User attended and is in DANGER
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="callStatus"
                    value="not_attended"
                    checked={callStatus === 'not_attended'}
                    onChange={(e) => setCallStatus(e.target.value)}
                    className="h-4 w-4 text-gray-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    ✗ User did NOT attend
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Add any additional notes about the call..."
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !callStatus}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Log'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}