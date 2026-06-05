import React from 'react';
import styles from './Card.module.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, hoverable = false, className = '', ...props }) => {
  return (
    <div 
      className={`${styles.card} ${hoverable ? styles.hoverable : ''} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};
