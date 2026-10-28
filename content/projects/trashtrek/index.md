---
slug: trashtrek
title: "TrashTrek"
description: "A fast paced endless runner game where the player collects trash and has to throw them to the correct trash bins."
status: COMPLETED
startedAt: 2025-08-18
endedAt: 2026-08-02
cover: ./cover.webp
gallery:
  - {
      image: ./gallery/running-with-bin.webp,
      alt: "Running through a street at 404 m with the energy bar mostly full; a green bin marked 3 and a green monster are ahead, and three collected trash types sit in the inventory at the bottom left",
    }
  - {
      image: ./gallery/delivering-trash.webp,
      alt: "At 1.54 km the player jumps toward a blue recycling bin marked 3, with a small green monster at the right edge of the street",
    }
  - {
      image: ./gallery/gap-jump.webp,
      alt: "At 69 m the player jumps over a gap in the pavement along a pastel street, with a piece of trash floating ahead",
    }
  - {
      image: ./gallery/game-over.webp,
      alt: "Game Over screen reading Player fell out of the world, with an overall score of 163 and three stats: 58, 1.69 km and 80",
    }
  - {
      image: ./gallery/shop.webp,
      alt: "Shop screen with a balance of 477 coins and two character skins, Default in a green cap and jacket and Student in a school uniform, both owned, with Student equipped",
    }
  - {
      image: ./gallery/green-cap-skin.webp,
      alt: "A character in a green cap and jacket running along the pavement of a pastel street, with no on-screen display",
    }
tools: ["Godot", "GDScript", "Python", "FastAPI", "MongoDB"]
credits:
  - { collaborator: dainzt }
  - { collaborator: dreyyiizz }
  - { collaborator: padre108 }
  - { collaborator: xandei }
githubUrl: https://github.com/dreyyiizz/TrashTrek
# draft: the description is a placeholder the owner replaces.
draft: false
---

This game is published on the [Game On Portal](https://gameonportal.ph/game/trashtrek).

A jumper game inspired by Zombie Tsunami, where the person can collect trash, and has to correctly throw the trash to the correct trash bins. The game also features a leaderboard system that is an extra feature using python and FastAPI, through either a local MongoDB instance or a cloud-based MongoDB service. The backend is in a [separate repository](https://github.com/wends05/trashtrek-server). The game also has a shop system for buying items to use in the game.

The game was developed using Godot Engine with GDScript. I also placed a leaderboard system that was an extra feature using python and FastAPI, through either a local MongoDB instance or a cloud-based MongoDB service. The backend is in a [separate repository](https://github.com/wends05/trashtrek-server).

Just like other games that I have made, I was able to learn about various patterns and techniques to make the game sustainable and maintainable in the future. For instance, I was able to implement abstract base classes for shop items which will allow me to easily add the logic of the Shop Items, which in a way is a sort of polymorphism. Another is the use of singletons for global state management or global functions, most especially used for API calls to the backend of the application. Also, the use of signals here were one of the things that I was able to focus on: encapsulating logic for a certain entity, and just letting listeners react to the signals emitted by the entity.
