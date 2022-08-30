import * as React from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { tomorrowNightBlue } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import rehypeKatex from 'rehype-katex';

import 'katex/dist/katex.min.css';
import './style/Content.css';

const components = {
  code({ node, className, ...props }) {
    props.children[0] = props.children[0].replace(/\n$/, '');
    const match = /language-(\w+)/.exec(className || '');
    return match
      ? (
        <div className="content-code">
          <SyntaxHighlighter
            language={match[1]}
            style={tomorrowNightBlue}
            showLineNumbers="true"
            {...props}
          />
        </div>
      )
      : <code className={className} {...props} />;
  },
};

function Content({ content }) {
  return (
    <ReactMarkdown
      className="content"
      components={components}
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
    >
      {content}
    </ReactMarkdown>
  );
}

Content.propTypes = {
  content: PropTypes.string.isRequired,
};

export default Content;
