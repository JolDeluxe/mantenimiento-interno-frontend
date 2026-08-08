import { cn } from '@/utils/cn';
import { formatHoursEquivalent, formatRawMinutes } from '../utils/dias-laborados-format';

export function DurationValue({
  value,
  align = 'left',
  primaryClassName = 'text-slate-800',
  secondaryClassName = 'text-slate-400',
}) {
  const equivalent = formatHoursEquivalent(value);
  return (
    <span
      className={cn(
        'inline-flex flex-col leading-tight',
        align === 'center' && 'items-center text-center',
        align === 'right' && 'items-end text-right',
      )}
    >
      <strong className={cn('font-black', primaryClassName)}>{formatRawMinutes(value)}</strong>
      {equivalent && (
        <span className={cn('mt-0.5 text-[10px] font-semibold', secondaryClassName)}>
          {equivalent}
        </span>
      )}
    </span>
  );
}

