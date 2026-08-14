
export function getAvatarUrl(profilePicture) {
  if (!profilePicture || profilePicture.trim() === '') {
    return 'https://api.dicebear.com/7.x/initials/svg?seed=User';
  }
  return profilePicture;
}

export function getAvatarInitials(name) {
  if (!name || name.trim() === '') {
    return 'U';
  }
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function renderAvatar(profilePicture, name) {
  const url = getAvatarUrl(profilePicture);
  const initials = getAvatarInitials(name);
  return { url, initials, isDefault: !profilePicture || profilePicture.trim() === '' };
}
