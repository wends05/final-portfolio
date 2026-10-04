# Portfolio documentation

Start with [docs/README.md](docs/README.md) for the portfolio's architecture, setup, database, UI conventions, current implementation status, and agent handoff guidance. Agents should also read [AGENTS.md](AGENTS.md).

The starter instructions below are retained for reference. Use the project-specific docs and current configuration when they differ.

Welcome to your new TanStack Start app!

# Getting Started

To run this application:

```bash
bun install
bun --bun run dev
```

# Building For Production

To build this application for production:

```bash
bun --bun run build
```

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) v4 with [shadcn/ui](https://ui.shadcn.com/) components (Base UI, `base-mira` style). Theme tokens live in `src/styles.css`. See [docs/ui.md](docs/ui.md).

## Linting & Formatting

This project uses [Biome](https://biomejs.dev/) for formatting and general linting, and [Oxlint](https://oxc.rs/docs/guide/usage/linter) with [`@shadcn/lint`](https://github.com/shadcn-ui/lint) for design-system rules:

```bash
bun --bun run lint      # Biome lint
bun --bun run format    # Biome format
bun --bun run check     # Biome format + lint + import order
bun --bun run lint:ds   # Oxlint + @shadcn/lint
```

See [docs/development.md](docs/development.md) for the current check baseline.


## Deploy with Nitro

This project uses Nitro as its server adapter. The build writes a self-contained server to `.output/`:

```bash
bun --bun run build
bun run .output/server/index.mjs
```

Built under Bun, Nitro selected its `bun` preset (recorded in `.output/nitro.json`). No deployment host has been chosen yet. For host-specific presets (Vercel, Netlify, Cloudflare, AWS Lambda, etc.), see https://v3.nitro.build/deploy.


## Database (Neon)

The app uses a Neon Postgres database through Prisma Next. Copy `.env.example` to `.env` and set `DATABASE_URL` to the connection string from the Neon console (project `portfolio`, branch `production`, database `neondb`). Then apply migrations:

```bash
bun --bun prisma db migrate
```

See [docs/data.md](docs/data.md) and [decision 0003](docs/decisions/0003-neon-database-and-portfolio-schema.md).



## Routing

This project uses [TanStack Router](https://tanstack.com/router) with file-based routing. Routes are managed as files in `src/routes`.

### Adding A Route

To add a new route to your application just add a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from "@tanstack/react-router";
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you render `{children}` in the `shellComponent`.

Here is an example layout that includes a header:

```tsx
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'My App' },
    ],
  }),
  shellComponent: ({ children }) => (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <header>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
          </nav>
        </header>
        {children}
        <Scripts />
      </body>
    </html>
  ),
})
```

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).

## Server Functions

TanStack Start provides server functions that allow you to write server-side code that seamlessly integrates with your client components.

```tsx
import { createServerFn } from '@tanstack/react-start'

const getServerTime = createServerFn({
  method: 'GET',
}).handler(async () => {
  return new Date().toISOString()
})

// Use in a component
function MyComponent() {
  const [time, setTime] = useState('')
  
  useEffect(() => {
    getServerTime().then(setTime)
  }, [])
  
  return <div>Server time: {time}</div>
}
```

## API Routes

You can create API routes by using the `server` property in your route definitions:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

export const Route = createFileRoute('/api/hello')({
  server: {
    handlers: {
      GET: () => json({ message: 'Hello, World!' }),
    },
  },
})
```

## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/people')({
  loader: async () => {
    const response = await fetch('https://swapi.dev/api/people')
    return response.json()
  },
  component: PeopleComponent,
})

function PeopleComponent() {
  const data = Route.useLoaderData()
  return (
    <ul>
      {data.results.map((person) => (
        <li key={person.name}>{person.name}</li>
      ))}
    </ul>
  )
}
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).



# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).

For TanStack Start specific documentation, visit [TanStack Start](https://tanstack.com/start).
