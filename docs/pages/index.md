---
title: NFToken - Solana NFT Standard
description: A simple standard for Solana NFTs
---

# NFToken Overview

NFToken is a simple, easy to use NFT standard for the Solana blockchain. With NFToken, you can:

- Create NFTs that represent art or other digital assets
- Update or freeze the NFTs you have created
- Organize a group of NFTs into a collection
- Retrieve NFTs for a wallet

## What is an NFT?

Today the most popular usecase for an NFT is to put a piece of digital artwork on chain. Once you have created an NFT, you can prove ownership and easily trade the NFT.

One of the most popular usecases is for Profile Pictures (or PFPs) where an artist will create a collection of similar NFTs that form a collection. Collectors purchase an NFT that they feel represents them and they use their NFT as their profile photo on social media. Cryptopunks and Bored Ape Yacht Club are both famous PFP collections.

While digital art is the most common usecase today, NFTs can represent any type of digital ownership. Here are some interesting usecases for NFTs today:

- A physical art gallery has created NFTs for the art gallery members. With one of their NFTs, you receive free admission to the art gallery events and Discord server.
- Musicians create NFTs that fractionalize their song royalties. As they get paid royalties for their song, a portion of the proceeds go to their NFT holders.
- Video games are creating NFTs to represent in-game items. This allows players to bring their in-game items between different games and to easily transfer / sell what they've earned in-game.
- API Keys
- POAP
- ...

## What is Solana?

Bitcoin and Ethereum are the two most popular blockchains. But they have major issues which make NFTs difficult. They are slow, expensive, and consume large amounts of energy to run.

Solana is an alternative blockchain designed to fix the problems with Bitcoin and Ethereum. Solana is designed to be:

- **Fast** — Transactions resolve in a couple seconds. This feels like a credit card transactions in contrast to Bitcoin and Ethereum where transactions take more than 5 minutes.
- **Cheap** — A Solana transaction typically costs less than $0.01. With NFToken, creating an NFT costs ~ $0.10. Bitcoin and Ethereum have transaction fees of more than $10.
- **Energy Efficient** — Bitcoin consumes more energy than the country of Argentina and Ethereum is close behind. Solana is exteremely efficient and uses the amount of energy equivalent to ~ 1,000 American homes.

# Getting Started

## Create Your First NFT

- Step 1 — Download a Wallet
  - Explain how wallets work
  - Download Glow
- Step 2 — Create an NFT
  - Upload Image
  - Choose Name'

{% create-nft-section /%}

## Create an NFT Collection

# Technical Details

The NFToken spec is designed to be easy for non-technical people to use. If you are a creator, aritst, or collector, you can create, sell, manage, and collect NFTs without needing to code.

If you are developer, it's easy to build on top of the NFToken standard to integrate NFTs into your dApp, crypto wallet, or other project. You can also extend the standard in interesting ways to add functionality to your NFT project.

## Solana Overview

You can think of Solana as a large key-value database. The Solana validator nodes store the entire state of the system in memory.

Solana has a slightly different terminology than a typical key-value database. Keys are referred to as addresses and each address point at two things — a SOL balance and a data field.

**Accounts on Solana**

Here are three common types of accounts on Solana:

- **Wallets** — Your wallet address points to your SOL balance. You can transfer part or all of your balance by signing an instruction that encodes the transfer.
- **Programs** — Solana Programs are compiled into bytecode and stored on the blockchain. Validators run the code of a program by loading it from the account on chain. The NFToken program is a single program deployed at address `TODO`.
- **Data Accounts** — Programs store data in different accounts on chain. An NFT is an example of a data account that is owned by the NFToken program and has data about the NFT, including who owns the NFT.

**How Transactions Work**

Solana uses a Proof of Stake voting system where the validator nodes add a block to the blockchain every ~ 400 ms. Each block consists of around 100 to 1,000 transactions.

Each transaction includes a series of instructions on how the validator should transform the state of the system. It could be as simple as sending SOL from one address to another address or it could be a more complex transaction that modifies the state of many addresses.

## Account Schemas

The NFToken program has a few different account types:

### NFT Account

NFT Accounts store the data for the NFT.

- `address` — The address of the account is the ID of the NFT. This is a unique identifier.
- `data`
  - `authority: Pubkey` — When the NFT is created, the `authority` is set to the creator. The creator can transfer the `authority` to another account.
  - `authority_can_update: bool` — The `authority` can update metadata about the NFT if `authority_can_update` is true. If `authority_can_udpate` is false, then the NFT is immutable and no one can update the metadata.
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

**Royalties**
The NFToken program lets you store how much should be paid in royalties to the different creators. Note that the NFToken program does not ensure that royalties will be paid out — that is up to the marketplace programs.

### NFT Metadata

We adhere to the OpenSea standard...

## Docs

You can find the Rust docs here: https://docs.rs/nftoken/latest/nftoken/

# Security

We take security seriously. The NFToken program is designed to be incredibly simple which makes auditing for security vulnerabilities straightforwards.

Each NFToken feature and instruction comes with a broad set of tests that validate the behavior and run before the code can be deployed.

# FAQ

**How does this compare with the Metaplex NFT standard?**
The Metaplex standard was written built [very quickly](https://twitter.com/aeyakovenko/status/1524798066347237376) and released on top of the SPL Token Program which is designed for Fungible Tokens (not NFTs).

While the Metaplex standard has gained popularity, it is difficult and expensive for developers and creators to use. Also Metaplex, is a private company that has not explained how they will make money or shared a public roadmap.

NFToken is designed to be cheaper, easier to use, and more open than Metaplex. Creating an NFT with NFToken is < 1/3 the price of a Metaplex NFT.

**Does this work on Bitcoin or Ethereum?**
No, the NFToken standard works only on the Solana blockchain. That means you'll need a Solana wallet like [Glow](https://glow.app) to interact with the NFToken standard.

# Roadmap

- **2022 June** — NFToken release with NFTs, Collections, Mintlists, and Royalties
- **2022 Q3**
  - Rust + Javascript Clients
  - NFT Marketplace Program
  - On Chain NFT Metadata
- **2022 Q4**
  - Programmable Art

# Changelog

## 2022-06-05 — 0.1.4

The testing program has been deployed to Mainnet and an initial version of this doc was created.
