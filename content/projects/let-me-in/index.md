---
slug: let-me-in
title: "SecuMmunity"
description: "A mini prototype for a subdivision entry and exit management system."
status: COMPLETED
startedAt: 2026-10-25
# endedAt: YYYY-MM-DD      # empty while ongoing
# cover: ./cover.png       # beside this file, at most 2400px wide
# gallery:
#   - { image: ./shot-1.png, alt: "What the image shows" }
tools: [
    "Python",
    "FastAPI",
    "ESP32-CAM",
    "Arduino",
    "OpenCV",
    "Tesseract OCR",
    "MongoDB",
    "React",
    "TypeScript",
    "Vite",
    "TanStack Query",
    "Tailwind CSS",
    "Three.js",
    "Turborepo",
    "Vitest",
    "Biome",
  ] # names from content/tools.yaml
# teamName: ""
credits:
  - { collaborator: regbarte, role: "Assembler / Pair" } # slugs from content/collaborators.yaml
githubUrl: https://github.com/regbarte/Vehicle-entry-and-exit-monitoring-project-using-ESP32-CAM
# liveUrl: https://…
# metadata:
#   - { label: event, value: "…" }
draft: true # set to false (or remove) to publish
---

A project for an academic requirement: Embedded Systems. The goal was to use any sort of hardware, and be able to connect it a software. Also ensure that the product would be solving some sort of problem.

One of the problems that this addresses was the slow entry and exit on subdivisions. So by using tesseract OCR, we can track the plate number and match that with the registered cars on the subdivision home owners. The output also detects guests. When a non registered plate number from the database is detected, the system will ask for a little more info: information of the driver, purpose of the driver's entry, and where the vehicle will be going.

The hardware used here are the ESP32 Camera, an arduino button, and a servo motor. The system uses python for the backend to connect the hardware and the dashboard together.
