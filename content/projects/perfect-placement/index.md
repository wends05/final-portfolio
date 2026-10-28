---
slug: perfect-placement
title: "Perfect Placement"
description: "An interactive hand-tracking sorting game written with OpenCV and GDScript."
status: COMPLETED
startedAt: 2024-10-13
endedAt: 2026-08-02
cover: ./cover.webp
gallery:
  - {
      image: ./gallery/category-select.webp,
      alt: "Category selection screen with a hand cursor between two aisle previews, produce on the left and drinks and snacks on the right, above the text SELECTING...",
    }
  - {
      image: ./gallery/fruits-guide-sheet.webp,
      alt: "Fruits and veggies level with the guide sheet open: a three by three grid showing which item goes in which shelf slot, over a box of produce and a half-filled shelf",
    }
  - {
      image: ./gallery/snacks-aisle-2-of-9.webp,
      alt: "Drinks and snacks level early on: 2 of 9 items shelved, a 2:46 timer, a cardboard box of items on the left and a tall shelf with SALE signs on the right",
    }
  - {
      image: ./gallery/you-win.webp,
      alt: "You Win screen with a confetti banner, a customer review reading Those shelves are so neat, I feel bad messing them up, 9 items arranged, 1:37 left, and an Exit button",
    }
tools: ["Godot", "GDScript", "Python", "MediaPipe", "OpenCV"]
credits:
  - { collaborator: reireiz }
  - { collaborator: khynie }
  - { collaborator: huenyeon }
  - { collaborator: kenchyyy }
githubUrl: https://github.com/wends05/perfect-placement
draft: false
---

A game used for a Hackathon (GameOn 2024, Festive Walk Iloilo) and is published on the [Game On Portal](https://gameonportal.ph/game/perfect-placement). The game is an interactive game where you use your hand to place items into a shelf that matches the list given to you.

This game was one of my best works in a sense that it further helped improve my understanding on another protocol aside from the standard HTTP that is commonly used in web development. The game uses UDP instead since it has to poll for the server's sent data from the python application, which is the camera's stream and hand detection data. The hand detection, aside from figuring out what the position of the detected hand is on, also detects if the hand is opened or closed.

With a small background in OOP from university, I was able to further understand concepts related to it through the game's implementation, including polymorphism (Stage structures, with slight differences), and encapsulation (calling a function, leaving the owner of that function to handle the logic).
