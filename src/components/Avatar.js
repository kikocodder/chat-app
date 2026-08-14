
export function Avatar({ profilePicture, userName, size = 40 }) {
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const hasValidImage = profilePicture && 
    typeof profilePicture === 'string' && 
    profilePicture.trim().length > 0;

  const initials = getInitials(userName);
  const bgColor = `hsl(${initials.charCodeAt(0) * 137 % 360}, 70%, 45%)`;

  if (hasValidImage) {
    return `
      <img 
        src="${profilePicture}" 
        alt="${userName}'s profile picture"
        width="${size}"
        height="${size}"
        style="border-radius: 50%; object-fit: cover;"
        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
      />
      <div 
        style="display: none; width: ${size}px; height: ${size}px; border-radius: 50%; background: ${bgColor}; color: white; align-items: center; justify-content: center; font-weight: 600; font-size: ${size * 0.35}px;"
      >
        ${initials}
      </div>
    `;
  }

  return `
    <div 
      style="width: ${size}px; height: ${size}px; border-radius: 50%; background: ${bgColor}; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: ${size * 0.35}px;"
    >
      ${initials}
    </div>
  `;
}

export function createAvatarElement({ profilePicture, userName, size = 40 }) {
  const avatar = document.createElement('div');
  avatar.style.display = 'inline-flex';
  avatar.style.position = 'relative';
  avatar.style.width = `${size}px`;
  avatar.style.height = `${size}px`;

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const hasValidImage = profilePicture && 
    typeof profilePicture === 'string' && 
    profilePicture.trim().length > 0;

  const initials = getInitials(userName);
  const bgColor = `hsl(${initials.charCodeAt(0) * 137 % 360}, 70%, 45%)`;

  if (hasValidImage) {
    const img = document.createElement('img');
    img.src = profilePicture;
    img.alt = `${userName}'s profile picture`;
    img.width = size;
    img.height = size;
    img.style.borderRadius = '50%';
    img.style.objectFit = 'cover';
    img.style.width = '100%';
    img.style.height = '100%';
    
    const fallback = document.createElement('div');
    fallback.style.display = 'none';
    fallback.style.width = '100%';
    fallback.style.height = '100%';
    fallback.style.borderRadius = '50%';
    fallback.style.background = bgColor;
    fallback.style.color = 'white';
    fallback.style.display = 'flex';
    fallback.style.alignItems = 'center';
    fallback.style.justifyContent = 'center';
    fallback.style.fontWeight = '600';
    fallback.style.fontSize = `${size * 0.35}px`;
    fallback.textContent = initials;

    img.onerror = () => {
      img.style.display = 'none';
      fallback.style.display = 'flex';
    };

    avatar.appendChild(img);
    avatar.appendChild(fallback);
  } else {
    avatar.style.borderRadius = '50%';
    avatar.style.background = bgColor;
    avatar.style.color = 'white';
    avatar.style.alignItems = 'center';
    avatar.style.justifyContent = 'center';
    avatar.style.fontWeight = '600';
    avatar.style.fontSize = `${size * 0.35}px`;
    avatar.textContent = initials;
  }

  return avatar;
}
