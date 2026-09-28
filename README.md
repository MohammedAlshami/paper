# Paper — React components for maps and logistics

Copy-paste components where a map is the visual: delivery tracking, store locators, fleet dashboards, route planning. Finished, product-facing screens, not another map wrapper.

- **Copy-paste, not a package.** No version to chase. Copy the file and own it.
- **Built on shadcn/ui and MapLibre GL.** Cards, buttons and badges come from the primitives you already have; the map is MapLibre with OpenFreeMap tiles, which is open source and needs no API key.
- **Real source in the docs.** Every component page shows the full file you paste, plus usage, examples and the API reference.

Live docs: **https://paper.mshami2021.workers.dev**

## Components

Built (all 30 from the plan):

**Tracking and delivery**

| Component | What it is for |
| --- | --- |
| `DeliveryTrackerCard` | Where the order is, who has it, and when it arrives. |
| `OrderRouteMini` | One order as a list row, with its route on a thumbnail. |
| `DriverArrivingSheet` | The ride-share moment: the car closing in, and who is in it. |
| `ShipmentJourney` | A shipment across trucks, ships and planes, leg by leg. |
| `ProofOfDelivery` | The record of a drop-off: photo, place, time, signature. |

**Store and place discovery**

| Component | What it is for |
| --- | --- |
| `StoreLocator` | Find the nearest one, on a map and in a list that agree with each other. |
| `PlaceCard` | One place: how good it is, how far it is, how to get there. |
| `NearbyList` | What is close, nearest first, with the walk. |
| `BranchDirectory` | Offices grouped by region, with the map and the contact details. |
| `EventVenueCard` | When and where, and where to park. |

**Location pickers and forms**

| Component | What it is for |
| --- | --- |
| `AddressPicker` | Search for an address or drop a pin, then confirm. |
| `ServiceAreaChecker` | Do we deliver to you? Type an address, get a yes or a no. |
| `PickupPointSelector` | Choose where to collect: lockers, stores, post offices. |
| `LocationBadge` | A city as a chip; hover it for a map. |
| `MapCoordinatesInput` | Latitude and longitude fields that move a pin, and back. |

**Fleet and operations**

| Component | What it is for |
| --- | --- |
| `FleetOverview` | Every vehicle on one map, with counts by status. |
| `VehicleDetailPanel` | One vehicle: speed, fuel, driver, and where it has been. |
| `DispatchBoard` | Drag a job onto a driver. Or tap it, on a phone. |
| `RouteOptimizerResult` | The route as booked against the route after optimising. |
| `GeofenceAlertFeed` | Who crossed which boundary, with a snapshot of where. |

**Data visualisation**

| Component | What it is for |
| --- | --- |
| `RegionChoropleth` | Regions shaded by a number, and ranked beside the map. |
| `OriginDestinationFlow` | Arcs between places, as thick as the volume between them. |
| `HeatmapCard` | Where activity is dense, for the hours you pick. |
| `CoverageMap` | Where a network reaches, and how well. |
| `TripReplay` | A recorded trip you can scrub and play back. |

**Travel and real estate**

| Component | What it is for |
| --- | --- |
| `TripSummaryCard` | A finished trip: the route, the numbers, and the climb. |
| `ItineraryMap` | A trip day by day, with the stops, the route and the list in step. |
| `PropertyMapCard` | Listings as price tags; pick one to see what is around it. |
| `CommuteCalculator` | How long to work from here? Drop a pin and see. |
| `WeatherAlertMap` | The regions under a storm, a flood or a closure. |

The original list of ideas is in [`docs/maps-component-ideas.md`](docs/maps-component-ideas.md). Each component also has a plain markdown doc under [`docs/components/`](docs/components).

## Install a component

Install the map engine and helpers:

```bash
pnpm add maplibre-gl lucide-react clsx tailwind-merge
```

Every map component imports one shared file, `map-kit.tsx` (the `useMap` hook, a canvas, a marker component, and geometry helpers). Copy it once, then add the shadcn/ui primitives a component uses and copy the component in:

```bash
pnpm dlx shadcn@latest add card button badge input
cp src/components/maps/map-kit.tsx ./src/components/maps/
cp src/components/maps/store-locator.tsx ./src/components/maps/
```

MapLibre runs its rendering in a web worker. `map-kit.tsx` points it at the worker with the Vite form (`?worker&url`); other bundlers need their own equivalent.

## Use it

```tsx
import { DeliveryTrackerCard } from '@/components/maps/delivery-tracker-card';

<DeliveryTrackerCard
  orderId="#48213"
  origin={{ label: 'Bi-Rite Market', position: [-122.4241, 37.7615] }}
  destination={{ label: '412 Hayes St', position: [-122.434, 37.7758] }}
  driver={{ name: 'Marcus Lee', vehicle: 'White Toyota Prius', rating: 4.9, position: driverPosition }}
  route={route}
  steps={steps}
  currentStepId="on-the-way"
  etaMinutes={6}
/>
```

Positions are `[longitude, latitude]`, longitude first, as in GeoJSON. Routes come from your own routing API (OSRM, Mapbox, Google); the components draw them and never fetch them.

## Develop

```bash
npm install
npm run dev      # docs on http://localhost:3100
npm run build
```
