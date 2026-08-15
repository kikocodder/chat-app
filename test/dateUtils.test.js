
import assert from 'assert';
import { formatRelativeTime } from '../src/utils/dateUtils.js';

function runTests() {
  const now = new Date();

  // Test "Just now" (< 1 minute)
  const justNow = new Date(now.getTime() - 30 * 1000);
  assert.strictEqual(formatRelativeTime(justNow), 'Just now', 'Should return "Just now" for < 1 minute');

  // Test "X min ago" (< 60 minutes)
  const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
  assert.strictEqual(formatRelativeTime(fiveMinAgo), '5 min ago', 'Should return "5 min ago" for 5 minutes');

  const oneMinAgo = new Date(now.getTime() - 1 * 60 * 1000);
  assert.strictEqual(formatRelativeTime(oneMinAgo), '1 min ago', 'Should return "1 min ago" for 1 minute');

  const fiftyNineMinAgo = new Date(now.getTime() - 59 * 60 * 1000);
  assert.strictEqual(formatRelativeTime(fiftyNineMinAgo), '59 min ago', 'Should return "59 min ago" for 59 minutes');

  // Test "X hours ago" (< 24 hours)
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  assert.strictEqual(formatRelativeTime(twoHoursAgo), '2 hours ago', 'Should return "2 hours ago" for 2 hours');

  const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
  assert.strictEqual(formatRelativeTime(oneHourAgo), '1 hour ago', 'Should return "1 hour ago" for 1 hour');

  const twentyThreeHoursAgo = new Date(now.getTime() - 23 * 60 * 60 * 1000);
  assert.strictEqual(formatRelativeTime(twentyThreeHoursAgo), '23 hours ago', 'Should return "23 hours ago" for 23 hours');

  // Test "Yesterday" (1 day ago)
  const yesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
  assert.strictEqual(formatRelativeTime(yesterday), 'Yesterday', 'Should return "Yesterday" for 1 day ago');

  // Test "X days ago" (< 7 days)
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  assert.strictEqual(formatRelativeTime(threeDaysAgo), '3 days ago', 'Should return "3 days ago" for 3 days ago');

  const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
  // Note: This might be "Yesterday" depending on exact timing, so we test 2 days
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  assert.strictEqual(formatRelativeTime(twoDaysAgo), '2 days ago', 'Should return "2 days ago" for 2 days ago');

  // Test standard date format (older dates)
  const oldDate = new Date('2023-10-12T10:00:00');
  const result = formatRelativeTime(oldDate);
  assert.ok(result.includes('Oct') && result.includes('12'), `Should return formatted date for old dates, got: ${result}`);

  // Test different year
  const oldDateDifferentYear = new Date('2022-01-15T10:00:00');
  const resultWithYear = formatRelativeTime(oldDateDifferentYear);
  assert.ok(resultWithYear.includes('Jan') && resultWithYear.includes('15') && resultWithYear.includes('2022'), 
    `Should include year for different year, got: ${resultWithYear}`);

  console.log('All tests passed!');
}

runTests();
