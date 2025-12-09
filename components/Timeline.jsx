import { format } from 'date-fns';

export function Timeline({ events }) {
  const getEventIcon = (type) => {
    switch (type) {
      case 'alert_triggered': return '🔔';
      case 'snooze': return '⏰';
      case 'call': return '📞';
      case 'alert': return '🚨';
      default: return '●';
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'alert_triggered': return 'bg-blue-500';
      case 'snooze': return 'bg-yellow-500';
      case 'call': return 'bg-green-500';
      case 'alert': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {events.map((event, eventIdx) => (
          <li key={event.id}>
            <div className="relative pb-8">
              {eventIdx !== events.length - 1 ? (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getEventColor(event.type)}`}>
                    <span className="text-white text-sm">
                      {getEventIcon(event.type)}
                    </span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">
                        {event.description}
                      </p>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {format(new Date(event.timestamp), 'MMM d, yyyy h:mm a')}
                    </p>
                    {event.details && (
                      <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                        {JSON.stringify(event.details, null, 2)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}