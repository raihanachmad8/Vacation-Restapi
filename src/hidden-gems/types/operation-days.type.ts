export type OperationDay = {
  day:
    | 'MONDAY'
    | 'TUESDAY'
    | 'WEDNESDAY'
    | 'THURSDAY'
    | 'FRIDAY'
    | 'SATURDAY'
    | 'SUNDAY';
  open_time: string; // Assuming HH:mm format
  close_time: string; // Assuming HH:mm format
};
