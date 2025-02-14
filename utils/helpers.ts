import { ZodError, ZodSchema, ZodObject } from "zod";

  /**
 * Utility function to debounce a given function.
 * @param func - The function to debounce.
 * @param delay - The delay in milliseconds.
 * @returns A debounced version of the function.
 */
  export const debounce = <F extends (...args: any[]) => any>(func: F, delay: number): (...args: Parameters<F>) => void => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<F>) => {
        if (timer) {
        clearTimeout(timer);
        }
        timer = setTimeout(() => {
        func(...args);
        }, delay);
    };
};

export const validateField = debounce(
    <T extends Record<string, any>>(
      field: keyof T,
      formData: T,
      schema: ZodSchema<T>,
      errors: Partial<Record<keyof T, string>>
    ) => {
      try {
        if (schema instanceof ZodObject) {
          const fieldPick = { [field]: true } as Record<string, true>;
  
          schema
            .pick(fieldPick)
            .parse({
              [field]: formData[field],
            });
  
          errors[field] = '';
        } else {
          throw new Error("The provided schema does not support 'pick' method.");
        }
      } catch (err) {
        if (err instanceof ZodError) {
          errors[field] = err.errors[0].message;
        } else {
          console.error(err);
        }
      }
    },
    300 
);

export const formatDate = (dateString: string | Date, format: string): string => {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const dayOfWeek = date.getDay();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December'
  ];

  if (format == 'DddMyyy') {
    return `${daysOfWeek[dayOfWeek].substring(0, 3)} ${String(day).padStart(2, '0')} ${months[month].substring(0, 3)} ${year}`;
  }
  

  return '';
};

export const getErrorFetchMessage = (error:any) : string  => {
    if (error.response) {
      return error.response._data.message;
    } else if (error.message) {
      return error.message ;
    }
  
    return 'Unknown error';
}

export const formatTimeToLocal = (isoString: string, timezone: string): string => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone
    }).format(date);
};

export const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

export const getParticipantColor = (name: string): string => {
  const colorClasses = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-teal-500'
  ];
  
  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
    
  return colorClasses[Math.abs(hash) % colorClasses.length];
};

export function IsWithinBusinessHours(startTime: string, endTime: string, userTimezone: string): boolean {
  const startUTC = new Date(startTime);
    const endUTC = new Date(endTime);

    function getTimeParts(date: Date, timeZone: string) {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).formatToParts(date);

        return {
            hour: parseInt(parts.find(part => part.type === 'hour')?.value || '0', 10),
            minute: parseInt(parts.find(part => part.type === 'minute')?.value || '0', 10),
        };
    }

    const startLocal = getTimeParts(startUTC, userTimezone);
    const endLocal = getTimeParts(endUTC, userTimezone);

    const businessStart = { hour: 8, minute: 0 };
    const businessEnd = { hour: 17, minute: 0 };

    function isWithinHours(time: { hour: number; minute: number }) {
        return (
            (time.hour > businessStart.hour || (time.hour === businessStart.hour && time.minute >= businessStart.minute)) &&
            (time.hour < businessEnd.hour || (time.hour === businessEnd.hour && time.minute <= businessEnd.minute))
        );
    }

    return isWithinHours(startLocal) && isWithinHours(endLocal);
}