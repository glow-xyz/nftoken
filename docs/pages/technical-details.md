---
title: Technical Details
---

# {% $markdoc.frontmatter.title %}

The NFToken spec is designed to be easy for non-technical people to use. If you are a creator, artist, or collector, you can create, sell, manage, and collect NFTs without needing to code.

If you are developer, it's easy to build on top of the NFToken standard to integrate NFTs into your dApp, crypto wallet, or other project. You can also extend the standard in interesting ways to add functionality to your NFT project.

## Solana Overview

You can think of Solana as a large key-value database. The Solana validator nodes store the entire state of the system in memory.

Solana has a slightly different terminology than a typical key-value database. Keys are referred to as addresses and each address point at two things — a SOL balance and a data field.

### Accounts on Solana

Here are three common types of accounts on Solana:

- **Wallets** — Your wallet address points to your SOL balance. You can transfer part or all of your balance by signing an instruction that encodes the transfer.
- **Programs** — Solana Programs are compiled into bytecode and stored on the blockchain. Validators run the code of a program by loading it from the account on chain. The NFToken program is a single program deployed at address `TODO`.
- **Data Accounts** — Programs store data in different accounts on chain. An NFT is an example of a data account that is owned by the NFToken program and has data about the NFT, including who owns the NFT.

### How Transactions Work

Solana uses a Proof of Stake voting system where the validator nodes add a block to the blockchain every ~ 400 ms. Each block consists of around 100 to 1,000 transactions.

Each transaction includes a series of instructions on how the validator should transform the state of the system. It could be as simple as sending SOL from one address to another address or it could be a more complex transaction that modifies the state of many addresses.

## Account Schemas

The NFToken program has a few different account types:

### NFT Account

NFT Accounts store the data for the NFT.

- `address` — The address of the account is the ID of the NFT. This is a unique identifier.
- `data`
  - `authority: Pubkey` — When the NFT is created, the `authority` is set to the creator. The creator can transfer the `authority` to another account.
  - `authority_can_update: bool` — The `authority` can update metadata about the NFT if `authority_can_update` is true. If `authority_can_update` is false, then the NFT is immutable and no one can update the metadata.
  - `holder: Pubkey` — This is who currently owns the NFT.
  - `delegate: Pubkey` — The `delegate` has permission to transfer the NFT once. This is useful for selling an NFT on the marketplace. When you list your NFT on a marketplace, the marketplace program will update the delegate to an account owned by the marketplace. When the NFT is sold, the marketplace uses the `delegate` to fulfill the sale and transfer the NFT to the new `holder`.
  - `metadata_url: String` — This is a string that points to a URL where the NFT metadata is stored.
  - `collection: Pubkey` — This is the collection that the NFT belongs to. This is a verified field — you cannot assign an NFT to a collection without permission.
  - `is_frozen: bool` — A frozen NFT cannot be transferred. This field can be changed by the `authority` if the NFT has `authority_can_update` equal to true.

### Collection Account

Collection Accounts store the data for the Collection. An NFT belongs to a collection if the `nft.collection` field points at the collection's address.

- `address` — The address of the account is the ID of the Collection. This is a unique identifier.
- `data`
  - `authority: Pubkey` — When the collection is created, the `authority` is set to the creator.
  - `authority_can_update: bool` — The `authority` can update the metadata if `authority_can_update` is `true`.
  - `metadata_url: String` — This is a string that points to a URL where the NFT metadata is stored.

### NFT Creators Account

While an NFT can only have one authority, you may want to list multiple creators to credit people involved with the NFT and to keep track of royalties.

- `address` — The creators account is a PDA so the address is derived from the seeds — `['creators', nft.address]`.
- `data`
  - `nft: Pubkey` — The address of the NFT.
  - `royalty_basis_points: u16` — A basis point is 1/100th of 1%. This is how much of each transaction should be paid out as a royalty to the creators.
  - `creators: Vec<NftSecondaryCreator>` — The `NftSecondaryCreator` object has an `address: Pubkey`, a `basis_points: u16`, and a `verified: bool`.

When you create the NFT Creators account, the `nft.has_creators` field is automatically marked `true`.

### Royalties

The NFToken program lets you store how much should be paid in royalties to the different creators.

{% callout %}

Note that the NFToken program does not ensure that royalties will be paid out — that is up to the marketplace programs.

{% /callout %}

### NFT Metadata

The current version of the spec gives each NFT and Collection a `metadata_url` which points to a JSON file offchain where the item's Metadata like `name`, `image,` and `attributes` are stored.

It's advantageous for most projects to store metadata offchain because:

1. It's cheaper. On Solana, storing data on chain costs money. If you only store the essential pieces on chain, creating and minting NFTs will be cheaper.
2. It's easier to update. If you decide that you want to update the Metadata, you can update your offchain data rather than updating all NFTs. This can be useful for some projects.
3. It's more flexible. Most NFToken clients will expect that your Metadata adheres to OpenSea's NFT standard (more info below), but there is no reason you can't add more data in NFTs that you create.

That being said, we are working on a version of the NFT Metadata spec that will allow NFT creators to store their Metadata on chain. This will be useful for higher value projects that want to pay more to have more data verifiable on chain.

### Metadata Format

We recommend the [OpenSea NFT Metadata Standard](https://docs.opensea.io/docs/metadata-standards#metadata-structure). Most wallets and NFT marketplaces will respect Metadata in that standard, so it's the most portable way to store Metadata..

## Docs

You can find the Rust docs here: [docs.rs/nftoken/latest/nftoken](https://docs.rs/nftoken/latest/nftoken/)
