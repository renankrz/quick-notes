import * as React from "react";
import { googlecode } from "react-syntax-highlighter/dist/esm/styles/hljs";
import PropTypes from "prop-types";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";
import SyntaxHighlighter from "react-syntax-highlighter";

import "katex/dist/katex.min.css";
import "./style/Content.css";

const components = {
  code({ node, className, ...props }) {
    props.children[0] = props.children[0].replace(/\n$/, "");
    const match = /language-(\w+)/.exec(className || "");
    return match ? (
      <div className="content-code">
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
