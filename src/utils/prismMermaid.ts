import { Prism } from 'prism-react-renderer';

// Register a custom Mermaid grammar with the bundled Prism instance.
Prism.languages.mermaid = {
  comment: /%%.*$/m,
  string: {
    pattern: /"[^"]*"/,
    greedy: true,
  },
  keyword: /\b(?:graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph|journey|mindmap|timeline|quadrantChart|sankey|xychart|block|subgraph|end|direction|participant|actor|as|loop|alt|else|opt|par|and|critical|break|rect|note|over|of|activate|deactivate|class|style|classDef|click|linkStyle|section|title|dateFormat|axisFormat|TB|TD|BT|RL|LR)\b/,
  arrow: {
    pattern: /<?[-=.]+>?[-=.]*>/,
    alias: 'operator',
  },
  label: {
    pattern: /\|[^|]*\|/,
    alias: 'attr-value',
  },
  bracket: {
    pattern: /[[\](){}]/,
    alias: 'punctuation',
  },
  separator: {
    pattern: /[;:]/,
    alias: 'punctuation',
  },
};

export { Prism };
