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
  code({ node, className, ...props }) {
    props.children[0] = props.children[0].replace(/\n$/, '');
    const match = /language-(\w+)/.exec(className || '');
    if (typeof props.inline === 'boolean') {
      props.inline = props.inline.toString();
    }
    return match ? (
      <div className="code">
        <SyntaxHighlighter
          language={match[1]}
          style={googlecode}
          showLineNumbers="true"
          {...props}
        />
      </div>
    ) : (
      <code className={className} {...props} />
    );
  },
};

function Content({ content }) {
  return (
    <ReactMarkdown
      className="content"
      components={components}
      remarkPlugins={[remarkMath]}
      rehypePlugins={[[rehypeKatex, { trust: true }], [rehypeRaw]]}
    >
      {content}
    </ReactMarkdown>
  );
}

Content.propTypes = {
  content: PropTypes.string.isRequired,
};

export default Content;
