import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  variant?: 'solid' | 'duotone' | 'outline';
}

/**
 * Transportation Category Icon
 * Professional vector representation of modern transit, airport routes, and logistics.
 */
export const TransportationCategoryIcon: React.FC<IconProps> = ({
  size = 24,
  className = '',
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Transportation Services"
      role="img"
      {...props}
    >
      <defs>
        <linearGradient id="trans-grad-blue" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0A2544" />
          <stop offset="1" stopColor="#1E5A99" />
        </linearGradient>
        <linearGradient id="trans-grad-orange" x1="16" y1="4" x2="28" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F97316" />
          <stop offset="1" stopColor="#EA580C" />
        </linearGradient>
      </defs>
      
      {/* Background soft circular pad */}
      <rect x="2" y="2" width="28" height="28" rx="8" fill="currentColor" fillOpacity="0.08" />

      {/* Airplane flight trajectory arrow in top right */}
      <path
        d="M26 6L18.5 9.5L15.5 8L16.5 10.5L14.5 11.5L13.5 10.5L12 11.25L13 13L9.5 14.75L21.5 11L26 6Z"
        fill="url(#trans-grad-orange)"
      />

      {/* Modern Transit Vehicle Silhouette */}
      <path
        d="M5 23.5V20C5 19.1716 5.67157 18.5 6.5 18.5H7.2L9.1 14.3C9.4 13.6 10.1 13 11 13H21C21.9 13 22.6 13.6 22.9 14.3L24.8 18.5H25.5C26.3284 18.5 27 19.1716 27 20V23.5C27 24.0523 26.5523 24.5 26 24.5H25V26C25 26.5523 24.5523 27 24 27H22.5C21.9477 27 21.5 26.5523 21.5 26V24.5H10.5V26C10.5 26.5523 10.0523 27 9.5 27H8C7.44772 27 7 26.5523 7 26V24.5H6C5.44772 24.5 5 24.0523 5 23.5Z"
        fill="url(#trans-grad-blue)"
      />

      {/* Windshield */}
      <path
        d="M10.7 15H21.3C21.6 15 21.9 15.2 22 15.5L23.4 18.5H8.6L10 15.5C10.1 15.2 10.4 15 10.7 15Z"
        fill="#FFFFFF"
        fillOpacity="0.9"
      />

      {/* Headlights */}
      <circle cx="8.5" cy="21.5" r="1.25" fill="#FBBF24" />
      <circle cx="23.5" cy="21.5" r="1.25" fill="#FBBF24" />

      {/* Road perspective dash */}
      <line x1="13" y1="29" x2="19" y2="29" stroke="url(#trans-grad-orange)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

/**
 * Maintenance Category Icon
 * Professional vector representation of property structure and engineering tools.
 */
export const MaintenanceCategoryIcon: React.FC<IconProps> = ({
  size = 24,
  className = '',
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Maintenance Services"
      role="img"
      {...props}
    >
      <defs>
        <linearGradient id="maint-grad-navy" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0A2544" />
          <stop offset="1" stopColor="#1B4978" />
        </linearGradient>
        <linearGradient id="maint-grad-amber" x1="14" y1="12" x2="28" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F97316" />
          <stop offset="1" stopColor="#EA580C" />
        </linearGradient>
      </defs>

      {/* Background container */}
      <rect x="2" y="2" width="28" height="28" rx="8" fill="currentColor" fillOpacity="0.08" />

      {/* Architectural Gable / House Outline */}
      <path
        d="M16 5.5L5 14.5H8V26.5C8 27.0523 8.44772 27.5 9 27.5H23C23.5523 27.5 24 27.0523 24 26.5V14.5H27L16 5.5Z"
        stroke="url(#maint-grad-navy)"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* Chimney */}
      <path d="M21 9V6.5H23.5V11" stroke="url(#maint-grad-navy)" strokeWidth="1.8" strokeLinecap="round" />

      {/* Precision Cross Wrench & Screwdriver Motif */}
      <path
        d="M13.5 16.5L18.5 21.5"
        stroke="url(#maint-grad-amber)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Wrench head */}
      <path
        d="M12 15L15 12C15.5 11.5 16 10.5 15.5 9.5C15 8.5 13.8 8.2 12.8 8.6C12.3 8.8 11.8 9.3 11.5 9.8L9.5 9L9 11.5L10 13L8.5 14.5L10 16L11.5 14.5L13 15.5L15.5 15L14.7 13C14.2 12.7 13.7 12.2 13.5 11.7"
        stroke="url(#maint-grad-amber)"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Engineering gear teeth accents inside home */}
      <circle cx="16" cy="18.5" r="2" fill="url(#maint-grad-amber)" />
    </svg>
  );
};

/**
 * Airport Transfers & Chauffeur Service Icon
 */
export const AirportTransferIcon: React.FC<IconProps> = ({
  size = 24,
  className = '',
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="ap-blue" x1="2" y1="2" x2="26" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0F3966" />
          <stop offset="1" stopColor="#2563EB" />
        </linearGradient>
      </defs>

      {/* Flight Departure Vector */}
      <path
        d="M22 5L15.5 8L13 6.5L13.8 8.8L12 9.7L11.2 8.8L10 9.5L10.8 11L7.5 12.7L18.5 9.5L22 5Z"
        fill="#EA580C"
      />
      {/* Jet Stream Trail */}
      <path
        d="M4 14C8 14 11 11 15 9"
        stroke="#EA580C"
        strokeWidth="1.5"
        strokeDasharray="2 2"
        strokeLinecap="round"
      />

      {/* Sedan Chauffeur Outline */}
      <path
        d="M3 21V18C3 17.4477 3.44772 17 4 17H5L7 13C7.2 12.4 7.8 12 8.5 12H17.5C18.2 12 18.8 12.4 19 13L21 17H22C22.5523 17 23 17.4477 23 18V21C23 21.5523 22.5523 22 22 22H21.5V23C21.5 23.5523 21.0523 24 20.5 24H19C18.4477 24 18 23.5523 18 23V22H8V23C8 23.5523 7.55228 24 7 24H5.5C4.94772 24 4.5 23.5523 4.5 23V22H4C3.44772 22 3 21.5523 3 21Z"
        fill="url(#ap-blue)"
      />
      {/* Windshield */}
      <path d="M8.2 13.8H17.8L19.2 16.5H6.8L8.2 13.8Z" fill="#FFFFFF" fillOpacity="0.85" />
      <circle cx="6.5" cy="19.5" r="1" fill="#FBBF24" />
      <circle cx="19.5" cy="19.5" r="1" fill="#FBBF24" />
    </svg>
  );
};

/**
 * Heavy Logistics & Equipment Transport Icon
 */
export const EquipmentTransportIcon: React.FC<IconProps> = ({
  size = 24,
  className = '',
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="eq-blue" x1="2" y1="2" x2="26" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0F3966" />
          <stop offset="1" stopColor="#0284C7" />
        </linearGradient>
      </defs>

      {/* Industrial Heavy Cargo Container */}
      <rect x="2" y="7" width="14" height="11" rx="1.5" fill="#EA580C" fillOpacity="0.9" />
      <line x1="6" y1="7" x2="6" y2="18" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.6" />
      <line x1="10" y1="7" x2="10" y2="18" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.6" />

      {/* Truck Cab */}
      <path
        d="M16 11H20.5L24 14.5V18C24 18.5523 23.5523 19 23 19H16V11Z"
        fill="url(#eq-blue)"
      />
      {/* Cab Window */}
      <path d="M17.5 12.5H20L22.5 15H17.5V12.5Z" fill="#FFFFFF" fillOpacity="0.9" />

      {/* Chassis bar */}
      <rect x="2" y="18" width="22" height="2" fill="#334155" />

      {/* Industrial Wheels */}
      <circle cx="6.5" cy="21.5" r="2.5" fill="#1E293B" />
      <circle cx="6.5" cy="21.5" r="1" fill="#94A3B8" />

      <circle cx="12.5" cy="21.5" r="2.5" fill="#1E293B" />
      <circle cx="12.5" cy="21.5" r="1" fill="#94A3B8" />

      <circle cx="20.5" cy="21.5" r="2.5" fill="#1E293B" />
      <circle cx="20.5" cy="21.5" r="1" fill="#94A3B8" />
    </svg>
  );
};

/**
 * Universal Service Icon Dispatcher
 * Returns appropriate high-craft SVG icon based on service slug or category ID.
 */
export const ServiceGlyph: React.FC<{
  slugOrId: string;
  size?: number | string;
  className?: string;
}> = ({ slugOrId, size = 24, className = '' }) => {
  switch (slugOrId) {
    case 'cat-transportation':
    case 'transportation':
    case 'transport':
      return <TransportationCategoryIcon size={size} className={className} />;

    case 'cat-maintenance':
    case 'maintenance':
      return <MaintenanceCategoryIcon size={size} className={className} />;

    case 'srv-airport-transfers':
    case 'airport-transfers':
      return <AirportTransferIcon size={size} className={className} />;

    case 'srv-equipment-transport':
    case 'equipment-transport':
      return <EquipmentTransportIcon size={size} className={className} />;

    default:
      return <MaintenanceCategoryIcon size={size} className={className} />;
  }
};
