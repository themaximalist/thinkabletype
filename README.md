# hypertype

<img src="logo.png" alt="HyperType" />

> Multidimensional Mind Mapping
>
> Interwingled Information Language
>
> HyperText over Hypergraphs
>
> A Language for Learning
>
> Cognitive Cartography
>
> A Database for Dreamers
>
> An IDE for Imagination
>
> A DSL for Data Explorers
>
> A Knowledge Graph Toolkit

HyperType is a way to represent concepts, ideas and information.

It's great at building [knowledge graphs](https://hypertyper.com) and aims to work the way you think.

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

Together these form the building blocks of HyperType.


## A New Kind of Knowledge Graph

Current knowledge graphs limit how we think. They don't visualize information in the way it's actually shaped.

Mind Mapping tries to squeeze complex relationships into a 2D hierarchy—stripped of context, interconnections and intuition.

HyperType is not about creating a simplified view of some information in your head—it's about getting lost in the forest, discovering deep insights, and finding your way back.

Here is [HyperTyper](https://hypertyper.com), a frontend UI to HyperType.

<video src="public/videos/hypertyper.mp4" autoplay muted loop></video>



## HyperTyping

Creating a `.hypertype` file is as simple as creating a text file with one or more of these connected ideas.

```yaml
Ted Nelson -> invented -> HyperText
Tim Berners-Lee -> invented -> WWW
HyperText -> influenced -> WWW
```

HyperType reads this file, builds the symbols and connections—and understand these ideas are interconnected.

Interconnectedness is a core idea in HyperType—called **interwingle**. Interwingle means knowledge is deeply interconnected and there isn't a clean way to divide it up.

HyperType provides this tool and many more to work with your information.

From PageRank, to Text Similarity, to LLMs, HyperType wants you to do the hard work of thinking—and then it will do everything it can to help you hit the high notes.



## HyperType Interface

HyperType is a lot of things. It's a DSL, it's a parser, it's a hypergraph database, it's a text similarity vector search engine, it's an AI Research Copilot.

But at it's core, it's just a library. You can install it from NPM like this

```bash
npm install @themaximalist/hypertype
```

You can import an existing `.hypertype` file (a CSV file)

```javascript
import HyperType from "@themaximalist/hypertype"
const hypertype = HyperType.parse("secret_research_project.hypertype");
```

Or you can build up a HyperType file programatically

```javascript
const hypertype = new HyperType();
hypertype.add(["Vannevar Bush", "author", "As We May Think"]);
hypertype.add(["Ted Nelson", "invented", "HyperText"]);
hypertype.add(["As We May Think", "influenced", "HyperText"]);
```

HyperType allows you control your knowledge graphs in the following ways:

**1. Control Interconnections**

```javascript
hypertype.interwingle = HyperType.INTERWINGLE.ISOLATE; // no interconnections
hypertype.interwingle = HyperType.INTERWINGLE.CONFLUENCE; // shared parents
hypertype.interwingle = HyperType.INTERWINGLE.FUSION; // shared start and end
hypertype.interwingle = HyperType.INTERWINGLE.BRIDGE; // shared middle
```

**2. Find important symbols with PageRank**

```javascript
const ted = hypertype.get("Ted Nelson");
// ted.pagerank has a reference of every node it touches and its weight
```

**3. Find hidden connections with Embeddings and Vector Search**

```javascript
hypertype.add("Red");
hypertype.add("Green");
await hypertype.similar("Pink"); // ["Red"]
```

**4. Suggest new symbols and connections with AI Copilot**

```javascript
const steve_invented = hypertype.add(["Steve Jobs", "invented"]);
await steve_invented.suggest(); // iPhone, Macintosh, NeXT, ...
```



HyperType lets you create data in an intuitive way, and offer tools to manage and amplify it.



## The Design of HyperType

A language for ideas needs a structureless structure. That's exactly what Stephen Wolfram found hypergraphs to be while working on his Universal Theory of Physics project.

Ted Nelson created Zig Zag as a "hyperstructure" kit—a way to represent information in HyperText systems.

*HyperType combines these ideas*, using the hypergraph as the fundamental unit in the HyperText system.

HyperType is a lot closer to symbolic programming than iterative programming. In iterative programming, you describe every little step. In symbolic programming, you describe the high-level concepts. It's top-down rather than bottom-up.

Something magical happens with symbolic programming. Like a looking glass, "the program" is a reflection of the connected symbols. It's a lot like language. You have legalese and then you have poetry.

HyperType is not a programming language in and of itself—but this high-level connecting of ideas is creating a sum greater than it's parts.

AI lets humans be human—letting us tell the computer what we want rather than tell every little step of how to get there. HyperType is like this—it's declarative, you say what you want, and the program tries to fill in the gaps.



## Alpha

HyperType is under heavy development and still subject to breaking changes. There isn't a full release yet, but the alpha code is available to try and experiment with.



## Projects

`LLM.js` is currently used in the following projects:

-   [HyperTyper](https://hypertyper.com)



## Author

-   [The Maximalist](https://themaximalist.com/)
-   [@themaximal1st](https://twitter.com/themaximal1st)



## License

MIT
