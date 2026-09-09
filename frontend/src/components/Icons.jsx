const Svg = ({ children, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
    >
        {children}
    </svg>
)

export const IconCode = (props) => (
    <Svg {...props}>
        <path d="m16 18 6-6-6-6" />
        <path d="m8 6-6 6 6 6" />
    </Svg>
)

export const IconServer = (props) => (
    <Svg {...props}>
        <rect x="3" y="4" width="18" height="7" rx="1.5" />
        <rect x="3" y="13" width="18" height="7" rx="1.5" />
        <line x1="7" y1="7.5" x2="7.01" y2="7.5" />
        <line x1="7" y1="16.5" x2="7.01" y2="16.5" />
    </Svg>
)

export const IconChip = (props) => (
    <Svg {...props}>
        <rect x="7" y="7" width="10" height="10" rx="1.5" />
        <path d="M9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4" />
        <rect x="10.5" y="10.5" width="3" height="3" rx="0.5" />
    </Svg>
)

export const IconShield = (props) => (
    <Svg {...props}>
        <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
        <path d="M9.5 12l2 2 3.5-3.5" />
    </Svg>
)

export const IconPlug = (props) => (
    <Svg {...props}>
        <path d="M12 22v-5" />
        <path d="M9 7V2M15 7V2" />
        <path d="M7 7h10v4a5 5 0 0 1-10 0V7z" />
    </Svg>
)

export const IconChat = (props) => (
    <Svg {...props}>
        <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-2.9-.4-4.1-1L3 20l1-5.1a8.5 8.5 0 1 1 17-3.4z" />
    </Svg>
)

export const IconUsers = (props) => (
    <Svg {...props}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
)

export const IconSearch = (props) => (
    <Svg {...props}>
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.35-4.35" />
    </Svg>
)

export const IconLayout = (props) => (
    <Svg {...props}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
    </Svg>
)

export const IconSliders = (props) => (
    <Svg {...props}>
        <line x1="4" y1="21" x2="4" y2="14" />
        <line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" />
        <line x1="20" y1="12" x2="20" y2="3" />
        <line x1="1" y1="14" x2="7" y2="14" />
        <line x1="9" y1="8" x2="15" y2="8" />
        <line x1="17" y1="16" x2="23" y2="16" />
    </Svg>
)

export const IconPhone = (props) => (
    <Svg {...props}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </Svg>
)

export const IconMail = (props) => (
    <Svg {...props}>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-10 6L2 7" />
    </Svg>
)

export const IconMapPin = (props) => (
    <Svg {...props}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </Svg>
)

export const IconClock = (props) => (
    <Svg {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
    </Svg>
)

export const IconArrowRight = (props) => (
    <Svg {...props}>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
    </Svg>
)

export const IconCheck = (props) => (
    <Svg {...props}>
        <path d="M20 6 9 17l-5-5" />
    </Svg>
)

export const IconMenu = (props) => (
    <Svg {...props}>
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="18" x2="20" y2="18" />
    </Svg>
)

export const IconX = (props) => (
    <Svg {...props}>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </Svg>
)
