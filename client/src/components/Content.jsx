import 'katex/dist/katex.min.css';
import './style/Content.css';

import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { googlecode } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';

const components = {
  // `node` is destructured only to keep it out of the props spread.
  // eslint-disable-next-line no-unused-vars
  code({ className, children, node, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    const text = String(children).replace(/\n$/, '');
    return match ? (
      <div className="code">
        <SyntaxHighlighter
          language={match[1]}
          style={googlecode}
          showLineNumbers
          {...props}
        >
          {text}
        </SyntaxHighlighter>
      </div>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};

function Content({ content }) {
  return (
    <div className="content">
      <ReactMarkdown
        components={components}
        remarkPlugins={[remarkMath]}
        rehypePlugins={[[rehypeKatex, { trust: true }], [rehypeRaw]]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

Content.propTypes = {
  content: PropTypes.string.isRequired,
};

export default Content;
