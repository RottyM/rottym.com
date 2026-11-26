export default function OpsBrandMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect
        x="1.5"
        y="1.5"
        width="33"
        height="33"
        rx="8"
        className="fill-card stroke-accent/60"
        strokeWidth="1.5"
      />
      <path
        d="M9 24V12H16.2C18.7 12 20.2 13.3 20.2 15.4C20.2 17.1 19.2 18.2 17.6 18.6L20.5 24H17.3L14.7 19H11.8V24H9ZM11.8 16.7H15.8C16.8 16.7 17.4 16.2 17.4 15.4C17.4 14.6 16.8 14.1 15.8 14.1H11.8V16.7Z"
        className="fill-foreground"
      />
      <circle cx="25.5" cy="13.5" r="2.7" className="fill-accent" />
      <path
        d="M23.5 24V18.5H27.5V24"
        className="stroke-accent"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
