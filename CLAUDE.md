# CLAUDE.md
## Project
Create a Reveal.js technical talk called:
# Putting *The Wire* on the Graph
## Who wins the game?
This is a small AI / graph / Collective Engine drop-in talk. It should feel sharp, grounded, and demonstrable, not like a manifesto, sales pitch, or overcooked systems-theory lecture.
The talk uses *The Wire* as a graph modelling example to ask:
> Who wins the game?
And then tests that question by modelling characters, organisations, roles, relationships, and timeline changes in one graph.
The talk should include a small closing nod to Collective Engine, but only as a natural extension of the graph experiment.
---
## Tone
Use plain, confident language.
Avoid sounding:
- preachy
- corporate
- philosophical
- manifesto-like
- too clever
- like a fan theory lecture
The presenter is a senior developer with 26.5 years of experience. The material should sound switched on, but not try-hard.
The talk should feel like:
> “I built a graph, poked at it, and it showed something interesting.”
Not:
> “Here is my grand theory of institutions.”
Use British English.
Avoid em dashes.
---
## Core framing
The central framing is:
> They say “the game is the game”.
> But does the graph back that up?
The talk should use the graph to test whether the game changes when:
- people are removed
- roles are reoccupied
- relationships change over time
- organisations shift
- characters move between contexts
The answer should be nuanced:
> Some people win moments.
> Some people get out.
> But the game carries on.
Do not say things like “Avon is the game”. That is wrong and too abstract.
Use grounded wording:
- “the game carries on”
- “the relationships shift”
- “the graph reorganises”
- “the role gets reoccupied”
- “the system does not simply collapse”
---
## Main technical idea
Use one graph, not separate graphs per season.
The graph should support a changing timeline:
- nodes persist across the model
- edges have active ranges
- roles can be occupied during certain seasons
- relationships can be active or inactive depending on the current season
- the talk can show the same graph under different time contexts
Represent this as:
```json
{
  "from": "stringer_bell",
  "to": "barksdale_org",
  "type": "LEADS",
  "season_start": 2,
  "season_end": 3
}

Or:

{
  "from": "stringer_bell",
  "to": "barksdale_org",
  "type": "WORKS_FOR",
  "season_start": 1,
  "season_end": 1
}

The talk should explain this simply as:

Same graph, different relationships active depending on where we are in the timeline.

Do not use terms like:

* bitemporal
* temporal graph theory
* valid time vs transaction time

Unless hidden in speaker notes for technical backup.

⸻

Graph model

Use these node types:

Person
Organisation
Role
Game
Place

Use these edge types:

WORKS_FOR
LEADS
MEMBER_OF
INVESTIGATES
TARGETS
CONTROLS
SUPPLIES
INFORMS
OPPOSES
OCCUPIES_ROLE
PLAYS_GAME
CONNECTED_TO

Keep labels readable on slides.

⸻

Important modelling idea: roles

Do not model one character “becoming” another character directly.

Instead, model role reoccupation:

Omar -> OCCUPIES_ROLE -> Outside Predator
Michael -> OCCUPIES_ROLE -> Outside Predator
McNulty -> OCCUPIES_ROLE -> Rule-Bending Detective
Sydnor -> OCCUPIES_ROLE -> Rule-Bending Detective

This lets the talk say:

Michael does not become Omar literally.
He starts occupying a similar structural role in the graph.

And:

The person changes. The role is reoccupied.

Keep this as a strong but short section.

⸻

“The game” modelling

Use Game nodes to show that “the game” is not only the drug trade.

Example nodes:

Drug Trade Game
Police Stats Game
Political Game
School System Game
Dock Survival Game

Example edges:

Barksdale Organisation -> PLAYS_GAME -> Drug Trade Game
Stanfield Organisation -> PLAYS_GAME -> Drug Trade Game
Baltimore Police Department -> PLAYS_GAME -> Police Stats Game
City Hall -> PLAYS_GAME -> Political Game
Tilghman Middle School -> PLAYS_GAME -> School System Game
Stevedores Union -> PLAYS_GAME -> Dock Survival Game

Keep this light. The talk should not become an essay about every institution.

Core point:

The phrase starts in the street, but the pattern shows up everywhere.

⸻

Key experiment: remove Avon

This is the main graph experiment.

Before removal:

Avon -> LEADS -> Barksdale Organisation
Stringer -> WORKS_FOR -> Avon
Barksdale Organisation -> CONTROLS -> West Baltimore Territory
Barksdale Organisation -> TARGETED_BY -> Baltimore Police Department

After removing Avon:

Stringer -> LEADS -> Barksdale Organisation
Barksdale Organisation -> CONTROLS -> West Baltimore Territory
Barksdale Organisation -> TARGETED_BY -> Baltimore Police Department

The line to use:

Avon goes. Stringer gets the bump. The relationships change, but the game carries on.

Important nuance:

Do not claim nothing changes.

Say:

The graph changes locally.
It reorganises.
But it does not simply collapse.

⸻

Other experiments

Use only one or two additional experiments. Do not overload the talk.

Possible options:

Remove McNulty

Purpose:

Show that the police game does not depend on one detective.

Suggested wording:

Take McNulty out and the institution does not suddenly become healthy.
The stats, politics, pressure, and incentives are still there.

Role reoccupation: Omar / Michael

Purpose:

Show that roles can persist even when characters change.

Suggested wording:

Michael is not Omar.
But by the end he is occupying a similar position in the graph.

Namond as exception

Purpose:

Add nuance.

Suggested wording:

Namond is interesting because he might be one of the few who gets out.
But he does not change the game.
He stops playing it.

Optional line:

Some people get out. Most people get replaced. The game carries on.

Namond / Clay Davis echo

Use this only as a small observation, not a whole argument.

Suggested wording:

There is also that nice uncomfortable echo where Namond starts sounding a bit like Clay Davis.
Different arena, same kind of game.

Do not overanalyse it.

⸻

Collective Engine nod

Keep this small and near the end.

Do not turn the talk into a manifesto.

Do not explain all of Collective Engine.

Do not use:

* superintelligence
* protocol is law
* dumb clients
* the 16 layers
* long architecture breakdowns

Use this instead:

The interesting bit for me is not just the answer.
It is that the graph lets you test it.

That is one of the things we are exploring with Collective Engine:
model the system as a graph, change it, and observe what actually changes.

Then move on.

Alternative shorter version:

That is the small nod to Collective Engine: model the system once, then poke it and see what changes.

⸻

Suggested slide structure

Create a Reveal.js deck with about 10 to 12 slides.

Slide 1: Title

Putting The Wire on the Graph

Who wins the game?

Speaker note:
This is not a deep lecture on graph databases. It is a small experiment: can a graph help us test whether “the game is the game”?

⸻

Slide 2: The question

Who wins the game?

Text:

Avon?
Stringer?
Marlo?
McNulty?
Carcetti?
Nobody?

Speaker note:
Do not answer yet. Let the audience sit with the question.

⸻

Slide 3: The setup

I modelled it as a graph

Text:

People
Organisations
Roles
Relationships
Time

Speaker note:
Keep this simple. Do not teach graph theory. Just explain what went into the model.

⸻

Slide 4: One graph, changing timeline

Same graph, different active relationships

Visual idea:

Season 1  [====]
Season 2       [====]
Season 3            [====]

Text:

Nodes stay.
Edges switch on and off.
Roles move.
Relationships change.

Speaker note:
This is important. We are not using separate season graphs. We are using one graph with time-aware relationships.

⸻

Slide 5: What is “the game”?

The game is not only the street

Text:

Drug trade
Police
Politics
Schools
Docks

Speaker note:
Do not overdefine “the game”. Keep it grounded. The idea is that each organisation has incentives and rules that shape behaviour.

⸻

Slide 6: Experiment 1, remove Avon

What happens if Avon is removed?

Before:

Avon -> leads -> Barksdale Org
Stringer -> works_for -> Avon
Barksdale Org -> controls -> territory

After:

Stringer -> leads -> Barksdale Org
Barksdale Org -> controls -> territory

Speaker note:
The important line: “Avon goes. Stringer gets the bump. The graph changes, but the game carries on.”

⸻

Slide 7: The graph reorganises

It does not stay the same

Text:

Leadership changes.
Relationships shift.
The organisation adapts.
The game carries on.

Speaker note:
This avoids sounding dumb. We are not saying nothing changes. We are saying the graph changes locally, but the wider pattern continues.

⸻

Slide 8: Roles get reoccupied

People change. Roles get reoccupied.

Text:

Omar -> Outside Predator
Michael -> Outside Predator
McNulty -> Rule-Bending Detective
Sydnor -> Rule-Bending Detective

Speaker note:
Make clear this is structural, not literal. Michael is not Omar. Sydnor is not McNulty. But the graph has similar positions being filled.

⸻

Slide 9: The exception

Does anyone get out?

Text:

Namond might.

Speaker note:
Namond is useful because he stops the talk becoming too deterministic. He may get out, but the game continues without him.

Optional line:
“Namond does not win the game. He stops playing it.”

⸻

Slide 10: Across organisations

Different arenas, same pattern

Text:

The street has a game.
The police have a game.
Politics has a game.
Schools have a game.

Speaker note:
Keep this short. This is not a full institutional analysis. It is just showing the phrase scales beyond the drug trade.

⸻

Slide 11: So who wins?

Who wins the game?

Text:

People win moments.
Some people get out.
Most roles get reoccupied.
The game carries on.

Speaker note:
This is the answer. Do not overtalk it.

⸻

Slide 12: Small Collective Engine nod

Why graphs matter

Text:

A graph lets you test change.
Remove a node.
Change a relationship.
Move the timeline.
See what actually happens.

Speaker note:
Then add the Collective Engine line:
“That is one of the things we are exploring with Collective Engine: model the system as a graph, change it, and observe what actually changes.”

⸻

Visual style

Use a dark theme.

Keep slides sparse.

Use:

* large text
* simple graph diagrams
* minimal bullets
* speaker notes for nuance

Avoid cramming slides with paragraphs.

Use one or two subtle screenshots or stylised graph visuals if available, but do not rely on copyrighted images from the show.

Prefer abstract graph diagrams over screenshots.

⸻

Reveal.js requirements

Create a standard Reveal.js project.

Files:

index.html
slides.md or inline HTML slides
css/custom.css
data/wire-graph.json
js/graph-demo.js
CLAUDE.md

Use Reveal.js Markdown slides if convenient.

Use Mermaid only for simple static diagrams.

For any interactive graph, use D3.js or Cytoscape.js.

Preferred: Cytoscape.js for graph rendering because it is easier to manipulate nodes/edges live.

⸻

Interactive graph demo

If building a small interactive demo, include:

Controls:

Season: 1, 2, 3, 4, 5
Toggle: Remove Avon
Toggle: Remove McNulty
Toggle: Show Roles
Toggle: Show Games

Data should be in data/wire-graph.json.

Edges should include:

{
  "id": "edge_stringer_leads_barksdale_s2",
  "source": "stringer_bell",
  "target": "barksdale_org",
  "label": "LEADS",
  "season_start": 2,
  "season_end": 3
}

The graph renderer should:

* show nodes
* show active edges for selected season
* fade inactive edges rather than deleting them, if possible
* hide removed nodes and their connected edges
* highlight changed roles after node removal
* keep layout reasonably stable

Do not overbuild the demo. It only needs to support the story.

⸻

Suggested sample nodes

[
  { "id": "avon_barksdale", "label": "Avon", "type": "Person" },
  { "id": "stringer_bell", "label": "Stringer", "type": "Person" },
  { "id": "marlo_stanfield", "label": "Marlo", "type": "Person" },
  { "id": "omar_little", "label": "Omar", "type": "Person" },
  { "id": "michael_lee", "label": "Michael", "type": "Person" },
  { "id": "jimmy_mcnulty", "label": "McNulty", "type": "Person" },
  { "id": "sydnor", "label": "Sydnor", "type": "Person" },
  { "id": "namond_brice", "label": "Namond", "type": "Person" },
  { "id": "clay_davis", "label": "Clay Davis", "type": "Person" },
  { "id": "barksdale_org", "label": "Barksdale Org", "type": "Organisation" },
  { "id": "stanfield_org", "label": "Stanfield Org", "type": "Organisation" },
  { "id": "baltimore_police", "label": "Baltimore Police", "type": "Organisation" },
  { "id": "city_hall", "label": "City Hall", "type": "Organisation" },
  { "id": "school_system", "label": "School System", "type": "Organisation" },
  { "id": "drug_trade_game", "label": "Drug Trade Game", "type": "Game" },
  { "id": "police_stats_game", "label": "Police Stats Game", "type": "Game" },
  { "id": "political_game", "label": "Political Game", "type": "Game" },
  { "id": "school_game", "label": "School Game", "type": "Game" },
  { "id": "kingpin_role", "label": "Kingpin", "type": "Role" },
  { "id": "operator_role", "label": "Operator", "type": "Role" },
  { "id": "outside_predator_role", "label": "Outside Predator", "type": "Role" },
  { "id": "rule_bending_detective_role", "label": "Rule-Bending Detective", "type": "Role" }
]

⸻

Suggested sample edges

[
  {
    "id": "avon_leads_barksdale_s1",
    "source": "avon_barksdale",
    "target": "barksdale_org",
    "label": "LEADS",
    "season_start": 1,
    "season_end": 1
  },
  {
    "id": "stringer_works_for_avon_s1",
    "source": "stringer_bell",
    "target": "avon_barksdale",
    "label": "WORKS_FOR",
    "season_start": 1,
    "season_end": 1
  },
  {
    "id": "stringer_leads_barksdale_s2",
    "source": "stringer_bell",
    "target": "barksdale_org",
    "label": "LEADS",
    "season_start": 2,
    "season_end": 3
  },
  {
    "id": "marlo_leads_stanfield_s3",
    "source": "marlo_stanfield",
    "target": "stanfield_org",
    "label": "LEADS",
    "season_start": 3,
    "season_end": 5
  },
  {
    "id": "barksdale_plays_drug_game",
    "source": "barksdale_org",
    "target": "drug_trade_game",
    "label": "PLAYS_GAME",
    "season_start": 1,
    "season_end": 3
  },
  {
    "id": "stanfield_plays_drug_game",
    "source": "stanfield_org",
    "target": "drug_trade_game",
    "label": "PLAYS_GAME",
    "season_start": 3,
    "season_end": 5
  },
  {
    "id": "police_play_stats_game",
    "source": "baltimore_police",
    "target": "police_stats_game",
    "label": "PLAYS_GAME",
    "season_start": 1,
    "season_end": 5
  },
  {
    "id": "city_hall_plays_political_game",
    "source": "city_hall",
    "target": "political_game",
    "label": "PLAYS_GAME",
    "season_start": 1,
    "season_end": 5
  },
  {
    "id": "omar_occupies_predator",
    "source": "omar_little",
    "target": "outside_predator_role",
    "label": "OCCUPIES_ROLE",
    "season_start": 1,
    "season_end": 5
  },
  {
    "id": "michael_occupies_predator",
    "source": "michael_lee",
    "target": "outside_predator_role",
    "label": "OCCUPIES_ROLE",
    "season_start": 5,
    "season_end": 5
  },
  {
    "id": "mcnulty_occupies_rebel_detective",
    "source": "jimmy_mcnulty",
    "target": "rule_bending_detective_role",
    "label": "OCCUPIES_ROLE",
    "season_start": 1,
    "season_end": 5
  },
  {
    "id": "sydnor_occupies_rebel_detective",
    "source": "sydnor",
    "target": "rule_bending_detective_role",
    "label": "OCCUPIES_ROLE",
    "season_start": 5,
    "season_end": 5
  },
  {
    "id": "namond_school_game",
    "source": "namond_brice",
    "target": "school_game",
    "label": "EXPOSED_TO",
    "season_start": 4,
    "season_end": 4
  }
]

⸻

Coding guidance

If generating the Reveal.js project:

* keep the implementation simple
* avoid build tooling unless necessary
* use CDN imports for Reveal.js and Cytoscape.js if appropriate
* make it runnable with a simple static server

Example:

python3 -m http.server 8080

Then open:

http://localhost:8080

⸻

Speaker style

Presenter should sound conversational.

Good phrases:

“I wanted to test this rather than just talk about it.”
“Same graph, different point in the timeline.”
“This is where the graph gets useful.”
“The relationships move. The game carries on.”
“That does not mean nothing changes.”
“Some people get out. Some get replaced.”
“People win moments. The game keeps going.”

Avoid:

“this proves everything”
“the graph is the only way”
“this is physics”
“superintelligence”
“protocol is law”
“Avon is the game”

⸻

Final closing

Use something like:

So who wins the game?

People win moments.
Some people get out.
Some people get replaced.

But when you look at the graph, the thing that keeps surviving is the game itself.

And that is the useful bit:
if you can model the game, you can test what changes it.

Then small Collective Engine nod:

That is the small connection back to Collective Engine:
model the system as a graph, change it, and observe what actually changes.

End there.

Do not add a summary slide after this.

Critique: This keeps the scope tight while giving Claude Code enough implementation detail to build a Reveal.js deck and optional live graph demo. It also guards against the exact failure mode you were worried about: drifting into manifesto waffle instead of proving the “game carries on” idea with the graph.
