# hypertype

> hypergraph programming language

HyperType is a new kind of symbolic programming language.

Symbolic programming is not like regular programming, instead of bottom-up it's top-down. It's high-level. It's declarative. You say what you want and the computer does the work.

Something magical happens with symbolic programming. Like a looking glass, "the program" is a reflection of the connected symbols. It's a lot like language. You have legalese and then you have poetry.

Crafting symbolic programs is the same.

```javascript
import HyperType from "@themaximalist/hypertype.js"
const hypertype = new HyperType();

await hypertype.similar("inventor") // invented

const hyperedge = await hypertype.get(["Ted Nelson", "invented"]);
await hyperedge.suggest(); // ["Xanadu"]
```



## Hypergraph Data Structure

Stephen Wolfram is using cellular automata to explore a universal Theory of Physics.

He's using a **hypergraph** as the fundamental data structure underneath everything.

He describes it as a "structureless structure"—the perfect building block.

A hypergraph is extremely simple to understand.

A -> B -> C

That's it. The symbols are A, B and C — and they're connected in this specific way.

It turns out, this is all we need.



## Organizing the Hypergraph

There's at least one "problem" with hypergraphs though—they can get extremely complex. This is actually a feature though, not a bug. You want hypergraphs to be able to handle complexity.

But making the user manage all the complexity won't work.

This is where embeddings, vector databases and LLMs come in. Together these tools help predict, organize, connect, update, explore, cluster and make sense of complex HyperType programs.



## HyperType is not a mind mapper

Mind Mapping is about organizing your thoughts in a linear view.

HyperType is about getting lost in the forest, gaining deep insights, and finding your way back.

It's a new kind of programming language and database, using the power of hypergraphs combined with the power of embeddings and LLMs.



## HyperType is a Meta DSL

HyperType is a domain specific language (DSL) superset over existing data formats.

It's basic format is CSV, because it's the easiest and most common way to represent a HyperGraph

```csv
Ted Nelson,invented,HyperText
Ted Nelson,invented,HyperMedia
```

This creates a HyperGraph where Ted Nelson invented both concepts.

This simple example can be loaded into HyperTypes

```javascript
import HyperType from "@themaximalist/hypertype.js"
const hypertype = await HyperType.parse("nelson.csv");

await hypertype.similar("inventor") // invented

const hyperedge = await hypertype.get(["Ted Nelson", "invented"]);
await hyperedge.suggest(); // ["Xanadu"]
```

In the future HyperType will be a superset of other data formats like HTML, JSON and Markdown.



## HyperType Programming Interface

You can build up HyperType programatically:

```javascript
import HyperType from "@themaximalist/hypertype.js"
const hypertype = new HtyperType();

const steve = await hypertype.create("Steve Jobs");
const invented = await htypertype.create("invented");
const hyperedge = await hypertype.create([steve, invented]);
const inventions = await hyperedge.similar(); // ["Apple", "NeXT", "Pixar", "Macintosh", "iPhone"]
```



## Projects

`LLM.js` is currently used in the following projects:

-   HyperTyper (coming soon)



## Author

-   [The Maximalist](https://themaximalist.com/)
-   [@themaximal1st](https://twitter.com/themaximal1st)



## License

MIT