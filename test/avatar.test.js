
import assert from 'assert';
import { getAvatarUrl, getAvatarInitials, renderAvatar } from '../src/avatar.js';

function runTests() {
  console.log('Running avatar fallback tests...\n');

  // Test getAvatarUrl
  assert.strictEqual(
    getAvatarUrl(null),
    'https://api.dicebear.com/7.x/initials/svg?seed=User',
    'Should return default URL for null'
  );
  console.log(' getAvatarUrl(null) returns default');

  assert.strictEqual(
    getAvatarUrl(undefined),
    'https://api.dicebear.com/7.x/initials/svg?seed=User',
    'Should return default URL for undefined'
  );
  console.log(' getAvatarUrl(undefined) returns default');

  assert.strictEqual(
    getAvatarUrl(''),
    'https://api.dicebear.com/7.x/initials/svg?seed=User',
    'Should return default URL for empty string'
  );
  console.log(' getAvatarUrl("") returns default');

  assert.strictEqual(
    getAvatarUrl('   '),
    'https://api.dicebear.com/7.x/initials/svg?seed=User',
    'Should return default URL for whitespace'
  );
  console.log(' getAvatarUrl("   ") returns default');

  assert.strictEqual(
    getAvatarUrl('https://example.com/avatar.png'),
    'https://example.com/avatar.png',
    'Should return provided URL when valid'
  );
  console.log(' getAvatarUrl(valid URL) returns the URL');

  // Test getAvatarInitials
  assert.strictEqual(getAvatarInitials('John Doe'), 'JD', 'Should return first and last initial');
  console.log(' getAvatarInitials("John Doe") returns "JD"');

  assert.strictEqual(getAvatarInitials('Alice'), 'A', 'Should return first initial for single name');
  console.log(' getAvatarInitials("Alice") returns "A"');

  assert.strictEqual(getAvatarInitials(''), 'U', 'Should return default for empty name');
  console.log(' getAvatarInitials("") returns "U"');

  assert.strictEqual(getAvatarInitials(null), 'U', 'Should return default for null name');
  console.log(' getAvatarInitials(null) returns "U"');

  assert.strictEqual(getAvatarInitials(undefined), 'U', 'Should return default for undefined name');
  console.log(' getAvatarInitials(undefined) returns "U"');

  assert.strictEqual(getAvatarInitials('  Bob  Smith  '), 'BS', 'Should handle extra whitespace');
  console.log(' getAvatarInitials("  Bob  Smith  ") returns "BS"');

  // Test renderAvatar
  const defaultAvatar = renderAvatar(null, 'John Doe');
  assert.strictEqual(defaultAvatar.isDefault, true, 'Should mark as default when no picture');
  assert.strictEqual(defaultAvatar.initials, 'JD', 'Should compute initials from name');
  assert.strictEqual(defaultAvatar.url, 'https://api.dicebear.com/7.x/initials/svg?seed=User', 'Should use default URL');
  console.log(' renderAvatar(null, "John Doe") returns default avatar with initials');

  const customAvatar = renderAvatar('https://custom.com/img.png', 'Jane Smith');
  assert.strictEqual(customAvatar.isDefault, false, 'Should not mark as default when picture exists');
  assert.strictEqual(customAvatar.initials, 'JS', 'Should compute initials from name');
  assert.strictEqual(customAvatar.url, 'https://custom.com/img.png', 'Should use custom URL');
  console.log(' renderAvatar(custom URL, "Jane Smith") returns custom avatar');

  const emptyStringAvatar = renderAvatar('', 'Test User');
  assert.strictEqual(emptyStringAvatar.isDefault, true, 'Should mark as default for empty string');
  console.log(' renderAvatar("", "Test User") returns default avatar');

  console.log('\n All tests passed!');
}

runTests();
