export function AlertBadge({ type }) {
  const badgeConfig = {
    danger: {
      text: 'DANGER PIN',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-200',
    },
    no_response: {
      text: 'NO RESPONSE AFTER 3 SNOOZES',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
      borderColor: 'border-orange-200',
    },
    snooze: {
      text: 'SNOOZE IN PROGRESS',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-200',
    },
    resolved: {
      text: 'RESOLVED',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-200',
    },
    default: {
      text: 'PENDING',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-200',
    }
  };

  const config = badgeConfig[type] || badgeConfig.default;

  return (
    <span className={`
      inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
      ${config.bgColor} ${config.textColor} border ${config.borderColor}
    `}>
      {config.text}
    </span>
  );
}