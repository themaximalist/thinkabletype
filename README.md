## ThinkableType 

<img src="public/logo.png" alt="ThinkableType — Knowledge Graph Library" class="logo" style="max-width: 500px;" />

<div class="badges" style="text-align: center;">
<a href="https://github.com/themaximal1st/thinkabletype"><img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/themaximal1st/thinkabletype"></a>
<a href="https://www.npmjs.com/package/@themaximalist/thinkabletype"><img alt="NPM Downloads" src="https://img.shields.io/npm/dt/%40themaximalist%2Fthinkabletype"></a>
<a href="https://github.com/themaximal1st/thinkabletype"><img alt="GitHub code size in bytes" src="https://img.shields.io/github/languages/code-size/themaximal1st/thinkabletype"></a>
<a href="https://github.com/themaximal1st/thinkabletype"><img alt="GitHub License" src="https://img.shields.io/github/license/themaximal1st/thinkabletype"></a>
</div>
<br />

<div class="names">
> Hypertext on Hypergraphs
>
> Multidimensional Mind Mapping
>
> Cognitive Cartography
>
> A DSL for Data Exploration
>
> Interwingled Information
>
> Strange Loop Language
>
> Knowledge Graph Toolkit
</div>

<span class="thinkable">Thinkable<span class="type">Type</span></span> is a way to represent concepts, ideas and information.

It's great at building [knowledge graphs](https://thinkmachine.com) and aims to work the way you think.

It's simple. It's based on a hypergraph, which doesn't sound simple, but it is:

```yaml
Ted Nelson,invented,HyperText
```

That's it, a series of connected ideas. Typically separated by a `,` or `->`

```yaml
Tim Berners-Lee -> invented -> WWW
```

What matters less is the syntax, and more that there are only two things:

* Symbols
* Connections

Together these form the building blocks of <span class="thinkable">Thinkable<span class="type">Type</span></span>.


## A New Kind of Knowledge Graph

Current knowledge graphs limit how we think. They don't visualize information in the way it's actually shaped.

Mind Mapping tries to squeeze complex relationships into a 2D hierarchy—stripped of context, interconnections and intuition.

<span class="thinkable">Thinkable<span class="type">Type</span></span> is not about creating a simplified view of some information in your head—it's about getting lost in the forest, discovering deep insights, and finding your way back.

Here is [Think Machine](https://thinkmachine.com), a frontend UI for the project.

<video src="videos/thinkmachine.mp4" autoplay muted loop></video>



## Creating a ThinkableType file

To create a <span class="thinkable">Thinkable<span class="type">Type</span></span> file, just create a CSV file with some connected ideas.

```yaml
Ted Nelson,invented,HyperText
Tim Berners-Lee,invented,WWW
HyperText,influenced,WWW
```

This file gets read, parsed and then a knowledge graph gets created with all the proper connections.

Interconnections are a core idea—called **interwingle**. Interwingle means knowledge is deeply interconnected and there isn't a clean way to divide it up.

Connections, and other tools like PageRank, Text Similarity and LLMs, are all included to help you make sense of your data.

<span class="thinkable">Thinkable<span class="type">Type</span></span> wants you to do the hard work of thinking—and then it will do everything it can to help you hit the high notes.


## Using ThinkableType

<span class="thinkable">Thinkable<span class="type">Type</span></span> is a lot of things. It's a DSL, it's a parser, it's a hypergraph database, it's a text similarity vector search engine, it's an AI Research Copilot.

But at it's core, it's just a library — and getting started is easy.

### Installing ThinkableType 

Install from NPM:

```bash
npm install @themaximalist/thinkabletype
```

### Load ThinkableType file

You can import an existing `.csv` file

```javascript
import ThinkableType from "@themaximalist/thinkabletype"
const thinkabletype = ThinkableType.parse("ancient_sumerians.csv");

// or specify a different separator
const thinkabletype = ThinkableType.parse("secret_research_project.csv", {
  parse: {
    delimiter: " -> "
  }
});
```

#### Initialize with data

You can also initialize with an existing list of nodes and connections (called Hyperedges).

```javascript
const hyperedges = [
  ["Plato", "student", "Socrates"],
  ["Aristotle", "student", "Plato"]
];

const thinkabletype = new ThinkableType({ hyperedges });
```

#### Build programatically

Or you can build up a file programatically

```javascript
const thinkabletype = new ThinkableType();
thinkabletype.add("Vannevar Bush", "author", "As We May Think");
thinkabletype.add("Ted Nelson", "invented", "HyperText");
thinkabletype.add("As We May Think", "influenced", "HyperText");
```

You can also build up a Hyperedge one symbol at a time.

```javascript
const edge = thinkabletype.add("Vannevar Bush");
edge.add("invented");
edge.add("Memex");
```

### Visualize ThinkableType

Connections and visualizations are a core part of <span class="thinkable">Thinkable<span class="type">Type</span></span>—so [Force Graph 3D](https://vasturiano.github.io/3d-force-graph/) is supported out of the box.

```javascript
const thinkabletype = new ThinkableType({
    hyperedges: [
        ["Hercules", "son", "Zeus"],
        ["Hercules", "son", "Alcmene"],
    ],
});
const data = thinkabletype.graphData(); // { nodes, links } for Force Graph 3D
```

In addition, an `interwingle` parameter is available to control the interconnections of the graph.


#### Interwingle Isolated

`Isolated` displays hyperedges exactly as they're entered, with no interconnections.

```javascript
const thinkabletype = new ThinkableType({
    interwingle: ThinkableType.INTERWINGLE.ISOLATED,
    hyperedges: [
        ["Hercules", "son", "Zeus"],
        ["Hercules", "son", "Alcmene"],
    ],
});

// hyperedges are displayed exactly as entered
const data = thinkabletype.graphData();
// Hercules -> son -> Zeus
// Hercules -> son -> Alcmene
```

![Interwingle Isolated Think Machine Example](images/hercules-interwingle-1.png)

#### Interwingle Confluence

`Confluence` connects common parents.

```javascript
const thinkabletype = new ThinkableType({
    interwingle: ThinkableType.INTERWINGLE.CONFLUENCE,
    hyperedges: [
        ["Hercules", "son", "Zeus"],
        ["Hercules", "son", "Alcmene"],
    ],
});

// nodes shares common ancestors
const data = thinkabletype.graphData();
//
//                  / Zeus
//  Herculues -> son
//                  \ Alcmene
//
```

![Interwingle Confluence Think Machine Example](images/hercules-interwingle-2.png)

#### Interwingle Fusion

`Fusion` connects starts and ends.

```javascript
const thinkabletype = new ThinkableType({
    interwingle: ThinkableType.INTERWINGLE.FUSION,
    hyperedges: [
        ["Plato", "student", "Socrates"],
        ["Aristotle", "student", "Plato"],
    ],
});

// start and end nodes are fused together
const data = thinkabletype.graphData();
// Aristotle -> student -> Plato -> student -> Socrates
```

![Interwingle Fusion Think Machine Example](images/aristotle-plato-socrates-interwingle-3.png)

#### Interwingle Bridge

`Bridge` connects common symbols with a bridge.

```javascript
const thinkabletype = new ThinkableType({
    interwingle: ThinkableType.INTERWINGLE.BRIDGE,
    hyperedges: [
        ["Vannevar Bush", "author", "As We May Think"],
        ["Ted Nelson", "author", "Computer Lib/Dream Machines"],
        ["Tim Berners-Lee", "author", "Weaving the Web"],
    ],
});

// common symbols are connected through a bridge
const data = thinkabletype.graphData();
//
//  Vannevar Bush   -> author -> As We May Think
//                     |
//  Ted Nelson      -> author -> Computer Lib/Dream Machines
//                     |
//  Tim Berners-Lee -> author -> Weaving the Web
```

![Interwingle Bridge ThinkableType Example](images/authors-interwingle-4.png)

These four views give you control in how to visualize your knowledge graph and control interconnections between your data.

As you scale up the `interwingle` parameter, all the visualization layers start to combine. Using `Fusion` automatically includes `Confluence`. And using `Bridge` automatically includes `Fusion` and `Confluence`. This lets you increase the complexity of the knowledge graph, step-by-step.



### PageRank

<span class="thinkable">Thinkable<span class="type">Type</span></span> helps you find the most referenced symbols and connections by running `PageRank` on your knowledge graph.

```javascript
const thinkabletype = ThinkableType.parse(`A,B,C
A,B,D
A,B,E
A,C,Z`);

await thinkabletype.sync(); // syncs pagerank
thinkabletype.pageranks // { A: <num>, B: <num>, ... }
thinkabletype.pagerank("Z") // { A: <num>, C: <num>, ... }
```

Note, <span class="thinkable">Thinkable<span class="type">Type</span></span> aims to work with very large knowledge graphs, so we keep expensive operations like `PageRank` explicit and in the background, controlled through `await thinkabletype.sync()` or `await thinkabletype.syncPagerank().`

### Embeddings and Vector Search

<span class="thinkable">Thinkable<span class="type">Type</span></span> can find similar symbols and hyperedges, not only by the explicit connections, but by the text similarity.

Using [Embeddings.js](https://embeddingsjs.themaximalist.com) and [VectorDB.js](https://vectordbjs.themaximalist.com), you can find hidden connections in your knowledge graph.

Note, both embeddings and vector search are local by default, but you can use embeddings from `OpenAI` with a few config lines.

#### Find Similar Symbols

Find similar symbols in the knowledge graph, on any edge.

```javascript
const thinkabletype = ThinkableType.parse(`Red,Green,Blue
White,Black,Gray`);
await thinkabletype.sync();

await thinkabletype.similarSymbols("Redish");
// [ { symbol: "Red": distance: 0.5 } ]
```

#### Find Similar Hyperedges

Find similar hyperedges based on symbols.

```javascript
const thinkabletype = new ThinkableType();
const edge1 = thinkabletype.add("Red", "Green", "Blue");
const edge2 = thinkabletype.add("Red", "White", "Blue");
const edge3 = thinkabletype.add("Bob", "Sally", "Bill");

await thinkabletype.sync();

await edge1.similar(); // [ Hyperedge("Red", "White", "Blue") ]
await edge2.similar(); // [ Hyperedge("Red", "Green", "Blue") ]
```

### Searching

Searching in <span class="thinkable">Thinkable<span class="type">Type</span></span> is easy, you can search by symbol, hyperedge or a partial
hyperedge.

```javascript
const thinkabletype = new ThinkableType({
    hyperedges: [
        ["Ted Nelson", "invented", "Xanadu"],
        ["Tim Berners-Lee", "invented", "WWW"],
        ["Tim Berners-Lee", "author", "Weaving the Web"],
        // ...
    ],
});
thinkabletype.filter("invented").length; // 2
thinkabletype.filter("Tim Berners-Lee").length; // 2
thinkabletype.filter("Tim Berners-Lee", "invented").length; // 1
```

### AI Auto Suggest

<span class="thinkable">Thinkable<span class="type">Type</span></span> has `suggest()` built in, which autocompletes any symbol or edge.

Using [LLM.js](https://llmjs.themaximalist.com), you can use any Large Language Model—like GPT-4, Claude, Mistral or local LLMs like [Llamafile](https://github.com/Mozilla-Ocho/llamafile).

```javascript
const options = {
    llm: {
        service: "openai",
        model: "gpt-4-turbo-preview"
        apikey: process.env.OPENAI_API_KEY
    }
};

const thinkabletype = new ThinkableType(options);
const hyperedge = thinkabletype.add("Steve Jobs", "inventor");
thinkabletype.suggest(); // ["iPhone", "Macintosh", "iPod", ... ]
```

This makes programatically expanding knowledge graphs with LLMs incredibly easy!

### AI Generate

<span class="thinkable">Thinkable<span class="type">Type</span></span> also has `generate()` built in, which generates hyperedges based on
your prompt. This is a great way to expand your knowledge graph in a particular
direction.

Just like with AI Auto Suggest, you can use any LLM.

```javascript
const options = {
    llm: {
        service: "openai",
        model: "gpt-4-turbo-preview",
        apikey: process.env.OPENAI_API_KEY,
    },
};

const thinkabletype = new ThinkableType(options);
const hyperedges = thinkabletype.generate("Steve Jobs");
// Steve Jobs,Apple Inc,CEO
// Steve Jobs,NeXT,Founder
// Steve Jobs,Macintosh,Personal Computers
// Steve Jobs,iPad,Tablet Computing
// ...
```



### CLI

<span class="thinkable">Thinkable<span class="type">Type</span></span> ships with a command-line interfaces for searching and generating files.

```bash
> thinkabletype epic of gilgamesh
epic of gilgamesh,sumerian literature,ancient civilization  
epic of gilgamesh,gilgamesh,enkidu,immortality,friendship  
sumerian literature,cuneiform writing,mesopotamia
...
```

By default it writes to stdout, either copy and paste to a `.csv` file or redirect the out

```bash
> thinkabletype mesopotamia > mesopotamia.csv
```



## The Design of ThinkableType

A language for ideas needs a structureless structure. That's exactly what Stephen Wolfram found hypergraphs to be while working on his Universal Theory of Physics project.

Ted Nelson created Zig Zag as a "hyperstructure" kit—a way to represent information in HyperText systems.

<span class="thinkable">Thinkable<span class="type">Type</span></span> combines these ideas, using the hypergraph as the fundamental unit in the HyperText system.

<span class="thinkable">Thinkable<span class="type">Type</span></span> is a lot closer to symbolic programming than iterative programming. In iterative programming, you describe every little step. In symbolic programming, you describe the high-level concepts. It's top-down rather than bottom-up.

Something magical happens with symbolic programming. Like a looking glass, "the program" is a reflection of the connected symbols. It's a lot like language. You have legalese and then you have poetry.

<span class="thinkable">Thinkable<span class="type">Type</span></span> is not a programming language in and of itself—but this high-level connecting of ideas is creating a sum greater than it's parts.

<span class="thinkable">Thinkable<span class="type">Type</span></span> is open source, and the file format is incredibly simple—just CSV files.

It's goal is to give you control over the knowledge and information in your life.

> File over app is a philosophy: if you want to create digital artifacts that last, they must be files you can control, in formats that are easy to retrieve and read. Use tools that give you this freedom.
>
> —[Steph Ango](https://stephango.com/file-over-app) (Obsidian Cofounder)



## Alpha

<a href="https://github.com/themaximal1st/thinkabletype"><span class="thinkable">Thinkable<span class="type">Type</span></span></a> is under heavy development and still subject to breaking changes.



## Projects

ThinkableType is currently used in the following projects:

-   [Think Machine](https://thinkmachine.com)



## Author

-   [The Maximalist](https://themaximalist.com/)
-   [@themaximal1st](https://twitter.com/themaximal1st)



## License

MIT
