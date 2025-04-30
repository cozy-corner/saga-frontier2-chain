import React, { ReactNode } from 'react';

interface ListItemProps {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

function Item({ children, selected, onClick, className = '' }: ListItemProps) {
  return (
    <li 
      className={`${selected ? 'selected' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </li>
  );
}

interface ListProps {
  children: ReactNode;
  className?: string;
}

function List({ children, className = '' }: ListProps) {
  return <ul className={className}>{children}</ul>;
}

// Attach Item as a property of List for dot notation usage
List.Item = Item;

export { List };
