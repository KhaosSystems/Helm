import { Children, HTMLAttributes, ReactElement, ReactNode, cloneElement, isValidElement } from 'react';

import MtAvatar, { MtAvatarProps, MtAvatarSize } from './MtAvatar';

export interface MtAvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  avatars?: MtAvatarProps[];
  children?: ReactNode;
  max?: number;
  size?: MtAvatarSize;
  spacing?: number;
}

const groupAvatarOutlineClass = 'outline-3 outline-[#111]';

// TODO: There is a package for this?
function mergeClassNames(...values: Array<string | undefined>): string {
  return values.filter(Boolean).join(' ');
}

function normalizeMax(max?: number): number {
  if (typeof max !== 'number' || Number.isNaN(max) || max < 0) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.floor(max);
}

function normalizeSpacing(spacing?: number): number {
  if (typeof spacing !== 'number' || Number.isNaN(spacing)) {
    return -4;
  }

  return spacing;
}

export default function MtAvatarGroup({
  avatars = [],
  children,
  max,
  size = 'sm',
  spacing = -4,
  className,
  ...props
}: MtAvatarGroupProps) {
  const avatarNodesFromData = avatars.map((avatar, index) => (
    <MtAvatar
      key={`data-avatar-${index}`}
      size={avatar.size ?? size}
      {...avatar}
      className={mergeClassNames(groupAvatarOutlineClass, avatar.className)}
    />
  ));

  const childNodes = Children.toArray(children)
    .filter((child): child is ReactElement<{ className?: string }> => isValidElement(child))
    .map((child, index) =>
      cloneElement(child, {
        key: child.key ?? `child-avatar-${index}`,
        className: mergeClassNames(groupAvatarOutlineClass, child.props.className),
      }),
    );

  const allAvatars = [...avatarNodesFromData, ...childNodes];
  const total = allAvatars.length;
  const maxToShow = normalizeMax(max);
  const avatarSpacing = normalizeSpacing(spacing);
  const visibleCount = Math.min(total, maxToShow);
  const surplus = Math.max(total - visibleCount, 0);
  const visibleAvatars = allAvatars.slice(0, visibleCount);

  return (
    <div className={['inline-flex items-center', className].filter(Boolean).join(' ')} {...props}>
      {visibleAvatars.map((avatar, index) => (
        <div
          key={`visible-avatar-${index}`}
          style={{ zIndex: visibleCount - index, marginLeft: index === 0 ? 0 : avatarSpacing }}
        >
          {avatar}
        </div>
      ))}

      {surplus > 0 && (
        <div style={{ zIndex: 0, marginLeft: visibleCount > 0 ? avatarSpacing : 0 }}>
          <MtAvatar size={size} initials={`+${surplus}`} alt={`${surplus} more`} className={groupAvatarOutlineClass} />
        </div>
      )}
    </div>
  );
}
