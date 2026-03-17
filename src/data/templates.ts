export interface Template {
  id: string;
  name: string;
  code: string;
}

export const templates: Template[] = [
  {
    id: 'flowchart',
    name: 'Flowchart',
    code: `graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> E[Fix the code]
    E --> B`,
  },
  {
    id: 'sequence',
    name: 'Sequence Diagram',
    code: `sequenceDiagram
    participant Client
    participant Server
    participant Database
    Client->>Server: HTTP Request
    Server->>Database: Query
    Database-->>Server: Results
    Server-->>Client: JSON Response`,
  },
  {
    id: 'class',
    name: 'Class Diagram',
    code: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +String breed
        +fetch()
    }
    class Cat {
        +bool indoor
        +purr()
    }
    Animal <|-- Dog
    Animal <|-- Cat`,
  },
  {
    id: 'state',
    name: 'State Diagram',
    code: `stateDiagram-v2
    [*] --> Idle
    Idle --> Processing : Submit
    Processing --> Success : Valid
    Processing --> Error : Invalid
    Error --> Idle : Reset
    Success --> Idle : New Task
    Success --> [*]`,
  },
  {
    id: 'er',
    name: 'ER Diagram',
    code: `erDiagram
    USER ||--o{ ORDER : places
    ORDER ||--|{ LINE_ITEM : contains
    PRODUCT ||--o{ LINE_ITEM : "ordered in"
    USER {
        int id PK
        string name
        string email
    }
    ORDER {
        int id PK
        date created
        string status
    }
    PRODUCT {
        int id PK
        string name
        float price
    }`,
  },
  {
    id: 'xychart',
    name: 'XY Chart',
    code: `xychart-beta
    title "Monthly Sales"
    x-axis [Jan, Feb, Mar, Apr, May, Jun]
    y-axis "Revenue (USD)" 0 --> 5000
    bar [1200, 1800, 2400, 3200, 4100, 4800]
    line [1000, 1500, 2200, 3000, 3800, 4500]`,
  },
];
