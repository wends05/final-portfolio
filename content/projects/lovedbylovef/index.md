---
slug: lovedbylovef
title: "Lovedbylovef"
description: "A crochet ordering and management app with Tanstack Start and Supabase."
status: COMPLETED
startedAt: 2026-02-03
endedAt: 2026-02-26
cover: ./gallery/home-page.webp
gallery:
  - {
      image: ./gallery/new-request.webp,
      alt: "Create Request form with a title, a description and an optional reference image upload, a Submit button, and a note that the request will be reviewed",
    }
  - {
      image: ./gallery/requests.webp,
      alt: "Customer Requests page with status filters from All to Cancelled and one approved request card with a Chat button",
    }
  - {
      image: ./gallery/order-page.webp,
      alt: "Order page showing a processing order with its total price, and the linked request with View Request Details and Open Chat buttons",
    }
tools:
  [
    "TypeScript",
    "React",
    "TanStack Start",
    "TanStack Router",
    "TanStack Query",
    "TanStack Form",
    "TanStack Table",
    "Tailwind CSS",
    "Base UI",
    "shadcn/ui",
    "Supabase",
    "Prisma",
    "PostgreSQL",
    "Zod",
    "Vite",
    "Vitest",
    "Biome",
    "Vercel",
    "Codex",
    "OpenCode",
  ]
githubUrl: https://github.com/wends05/lovedbylovef
liveUrl: https://lovedbylovef.vercel.app
# draft: the description is a placeholder the owner replaces.
draft: false
---

A small project based on a certain business from one of my friends. This friend creates crochets as a hobby and a business, and I came up with an idea to make a management system for tracking orders as well as trying to get more customers with an ordering system inside the application.

I took what I knew during that time: Tanstack Start, Zod, and Supabase’s auth, db, and storage and Prisma (v7) as the ORM. I also looked into the supabase realtime, which allowed me to be able to make a chat function inside the application as well. I have used both Kimi and Codex for the development of the application, and used Claude later for maintenance and later work. All of which helped me with the implementation chores, initial designs, pull requests, but ensuring that most important decisions remain for me to decide on including tech stack decisions, component logic, folder structure, etc.

The result: A customer can browse crochets, and can also create an account to start ordering crochets. Both the customer and the owner can chat together to agree on possible designs needed, or the price. The owner can set the status, and the customer can update if it is delivered already. The owner can also optionally add a gallery of different crochets that has been ordered already.
