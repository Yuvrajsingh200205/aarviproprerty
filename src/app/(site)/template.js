// Re-mounts on every navigation, giving each page a soft fade-up entrance.
export default function Template({ children }) {
  return <div className="animate-fade-up [animation-duration:.45s]">{children}</div>;
}
