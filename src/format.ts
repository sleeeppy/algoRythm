export function formatStamp(stamp: string): string {
  const year = stamp.slice(0, 4);
  const month = Number(stamp.slice(4, 6));
  const day = Number(stamp.slice(6, 8));
  return `${year}년 ${month}월 ${day}일`;
}
