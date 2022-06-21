---
title: Mintlists
---

# {% $markdoc.frontmatter.title %}

With a Mintlist, you can set up a website or app where users can mint NFTs for a given price. This is particular useful for NFT drops and launches in which a collection of NFTs become available to mint at a specific launch time.

## Comparison to Metaplex's CandyMachine

The Mintlist is similar to [Metaplex's CandyMachine](https://docs.metaplex.com/candy-machine-v2/introduction) with a few differences:

1. Mintlists are cheaper than CandyMachines.
2. The Mintlist program is built into the NFToken spec while the CandyMachine program requires the SPL Token program and the Metaplex Metadata program.
3. Mintlists always mint new NFTs into a collection. With CandyMachine, you need to follow an additional process to set up a collection.
4. You can create a Mintlist from a website (including this docs page). CandyMachine typically requires coding knowledge and using a terminal.
5. CandyMachine has more features such as whitelists and paying with a token other than SOL. Some of these features are on the Mintlist roadmap.

## Mintlist Schema

The Mintlist is one account which is owned by the NFToken program. The Mintlist stores information about the NFTs that are available to mint along with the collection that they will be minted into.

When you first create a Mintlist it will be in a _configuring_ state. You have to add all NFTs before the Mintlist becomes in the _ready_ state and people can mint from it.

**TODO: insert state diagram**

**Data**

- `authority` — The account that is allowed to configure, update, and close the Mintlist.
- `price_lamports` — The amount of SOL that each minter will be paying to receive a single NFT.
- `treasury_sol` — The account that will receive the payments each minter is making when they mint an NFT.
- `go_live_date` — The date at which minters will be able to start minting NFTs. If you submit a transaction before the `go_live_date`, the transaction will fail.
- `minting_order` - The order NFTs will be minted in.
  - `Sequential` - Each minter will receive next available NFT.
  - `Random` - Each minter will receive a random NFT. This uses a previous blockhash as a source for randomness.
- `collection` - The collection that NFTs will be minted into
- `metadata_url` - This points to Metadata that can hold the name and image for the Mintlist. This adheres to the same offchain Metadata standard as NFTs.
- NFT Mint Data Params
  - `num_nfts_total` - This is total number of NFTs that will be available to mint once the Mintlist has been configured.
  - `num_nfts_redeemed` - If users have started minting, this will show the number of NFTs that have been minted from the list.
  - `num_nfts_configured` - This stores the number of NFTs that have been added to the Mintlist. The Mintlist will be ready once `num_nfts_configured == num_nfts_total`.
  - `mint_infos` - This stores information about each NFT. Each NFT is defined by a `metadata_url`.

## Mintlist Instructions

### `mintlist_create`

### `mintlist_add_infos`

### `mintlist_add_infos`

## Creating a Mintlist
