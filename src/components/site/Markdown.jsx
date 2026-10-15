import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// The page already owns the <h1>, so content headings are demoted one level (# -> h2, ## -> h3 …).
const demote = (Tag) =>
  function Heading({ node, ...props }) {
    return <Tag {...props} />;
  };
const components = { h1: demote('h2'), h2: demote('h3'), h3: demote('h4'), h4: demote('h5'), h5: demote('h6'), h6: demote('h6') };

// react-markdown does not render raw HTML, so admin-entered content cannot inject scripts.
export default function Markdown({ children, className = '' }) {
  if (!children) return null;
  return (
    <div className={`prose prose-slate max-w-none prose-headings:font-serif prose-headings:text-brand-900 prose-a:text-brand-700 prose-img:rounded-xl ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
