# Fictional client portal first slice

Build login, an owner-scoped project list, create/edit and logout. Define two synthetic actors and a forbidden record before writing routes. Server helpers verify identity and bind every mutation to actor ownership. Add private uploads only after that journey works. Keep notifications mocked and payments disabled until requested.

The first useful result is a saved record that the other actor cannot enumerate or alter. Tables/search/counts share one authorization predicate. Cross-organization IDs fail even when guessed directly. Distinguish a fixture implementation from live provider readiness.
