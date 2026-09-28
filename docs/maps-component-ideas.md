# Map components — 30 ideas

Direction: copy-paste React components where a map is the visual. Finished, product-facing pieces, not map plumbing. Built on MapLibre GL and shadcn/ui primitives.

## Tracking and delivery

1. **DeliveryTrackerCard** (built) — a live map with driver, ETA, and status steps (packed → out → arriving)
2. **OrderRouteMini** (built) — a compact static-map thumbnail with the route line, for list rows
3. **DriverArrivingSheet** (built) — a ride-share style bottom sheet with driver, car, and plate
4. **ShipmentJourney** (built) — a multi-leg trip (air → sea → truck) with a mini map on each leg
5. **ProofOfDelivery** (built) — a drop-off photo, a location pin, a timestamp, and a signature

## Location pickers and forms

6. **AddressPicker** (built) — search plus a draggable pin, with a confirm-location card
7. **ServiceAreaChecker** (built) — "do we deliver to you?" with a zone overlay and a yes/no state
8. **PickupPointSelector** (built) — nearby lockers and stores as a map and list
9. **LocationBadge** (built) — an inline city/country chip with a hover map preview
10. **MapCoordinatesInput** (built) — lat/lng fields synced to a mini map

## Store and place discovery

11. **StoreLocator** (built) — search, filter chips, a synced list and map, and open-now status
12. **PlaceCard** (built) — photo, rating, distance, and an "open in maps" action
13. **NearbyList** (built) — results sorted by distance, with a walking-time chip
14. **BranchDirectory** (built) — offices grouped by region with a map and contact cards
15. **EventVenueCard** (built) — date, venue, and an embedded map with parking hints

## Fleet and operations dashboards

16. **FleetOverview** (built) — a map with a status-filtered vehicle list and KPI strip
17. **VehicleDetailPanel** (built) — speed, fuel, driver, and a trip history mini-map
18. **DispatchBoard** (built) — unassigned jobs on the left, a map on the right, drag to assign
19. **RouteOptimizerResult** (built) — before/after route comparison with distance and time saved
20. **GeofenceAlertFeed** (built) — "Truck 12 left Zone A" events, each with a location snapshot

## Data visualisation

21. **RegionChoropleth** (built) — countries or states shaded by a metric, with a ranked side list
22. **OriginDestinationFlow** (built) — arcs between cities, weighted by volume
23. **HeatmapCard** (built) — an activity density map with a time-range slider
24. **CoverageMap** (built) — network or service coverage with a legend and stats
25. **TripReplay** (built) — a scrubber that replays a path with speed and stop markers

## Travel, real estate, and trips

26. **ItineraryMap** (built) — day-by-day stops, with the list and route linked
27. **PropertyMapCard** (built) — a listing with price pins and a neighborhood-radius overlay
28. **CommuteCalculator** (built) — "time to work" isochrone from a chosen address
29. **TripSummaryCard** (built) — a Strava-style route thumbnail with distance and elevation
30. **WeatherAlertMap** (built) — a region overlay for storms or closures with a severity legend
