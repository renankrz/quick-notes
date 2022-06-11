import React from 'react';
import PropTypes from 'prop-types';

import ReactMarkdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; // `rehype-katex` does not import the CSS

import './Card.css';

const components = {
  // eslint-disable-next-line react/prop-types
  code({ node, className, ...props }) {
    // eslint-disable-next-line react/prop-types, no-param-reassign
    props.children[0] = props.children[0].replace(/\n$/, '');
    const match = /language-(\w+)/.exec(className || '');
    return match
      ? (
        <div className="markdown-code">
          <SyntaxHighlighter
            language={match[1]}
            style={nightOwl}
            showLineNumbers="true"
            {...props}
          />
        </div>
      )
      : <code className={className} {...props} />;
  },
};

const MarkdownBlock = ({ markdown }) => (
  <ReactMarkdown
    className="markdown"
    components={components}
    remarkPlugins={[remarkMath]}
    rehypePlugins={[rehypeKatex]}
  >
    {markdown}
  </ReactMarkdown>
);

MarkdownBlock.propTypes = {
  markdown: PropTypes.string.isRequired,
};

export default MarkdownBlock;
