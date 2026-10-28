---
slug: bellman-ford-game
title: "Bellman-Ford exploration game"
description: "An exploration game based off the Bellman-Ford algorithm."
status: COMPLETED
startedAt: 2025-03-21
endedAt: 2025-06-03
cover: ./cover.webp
gallery:
  - {
      image: ./gallery/start.webp,
      alt: "Godot editor with the start scene open: two doors, labelled Start and Instructions, on a flat grey ground",
    }
  - {
      image: ./gallery/level-1.webp,
      alt: "Godot editor showing level 1: a bright blue floor with white door panels marked 0 and scattered white cubes",
    }
  - {
      image: ./gallery/level-8.webp,
      alt: "Godot editor showing level 8: pale platforms and slopes over a brown floor, with numbered doors on the far platform",
    }
  - {
      image: ./gallery/stats.webp,
      alt: "In-game Game Statistics screen listing total energy, goal energy, the goal path and the path passed",
    }
  - {
      image: ./gallery/end-door.webp,
      alt: "End door scene in the Godot editor: a door with a large window and a door handle",
    }
tools: ["Godot", "GDScript", "Go", "Gin"]
githubUrl: https://github.com/wends05/algo-project
# draft: the description is a placeholder the owner replaces.
draft: false
---

A project for an academic requirement in university. One of the best works I have done, while also being able to learn new concepts and technologies along the way.

Task: Be able to use an algorithm and make a user interface out of it. With a bellman-ford algorithm, I decided to make a game out of it, following common concepts used from the Djikstra’s algorithm. For content, the Bellman-Ford algorithm is basically just a Djikstra’s algorithm with negative edges, allowing for negative cycle detection.

The game I made is an exploration game, you try to reach the end of the path by traversing through doors and get the most energy or highest energy possible. You can go back to restore the energy you lost / received. Energy in this game is the “edge weights” in terms of the Bellman Ford algorithm.

I had other goals for this project aside from just learning the algorithm, being able to see a real world scenario / case for it, and completing the academic requirement. I wanted to explore how 3D games work, and learn concepts in the Go language. Initially as well I wanted to learn Blender alongside it, but decided not to since it looked complicated to me, but I was able to create a door that you can see in the game itself.

The result: A 3D game made with Godot and a connected Gin backend in Go. Assets I made is only the door, and the rest were in game shapes. Gin was a randomly picked backend.
