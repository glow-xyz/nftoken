---
title: Selling NFTs with Mintlists
---

# {% $markdoc.frontmatter.title %}

You can create and sell a new NFT collection by creating a Mintlist.

A Mintlist is an account on chain that acts like a store for new NFTs. When you create the Mintlist, you choose:

- the number of NFTs in the collection
- the price in SOL that minters will pay to receive an NFT
- the go live date after which customers can begin minting NFTs

The Mintlist account holds information about the new NFTs on chain so that new customers can call the `mintlist_mint_nft_v1` instruction and Mint an NFT.

A Mintlist costs a bit of SOL to set up, around 0.6 SOL for a Mintlist with 1,000 NFTs, but at any point you can close the Mintlist to receive that SOL back in your wallet. So from start to end it's a free process for the NFT project creator.

## Configuring a Mintlist

{% picture light="/mintlist-states-light.png" dark="/mintlist-states-dark.png" /%}

When you create a Mintlist, it will be in the `Pending` state. It will hold information about the collection and how much NFTs will cost, but it doesn't hold the NFT data.

You'll need to add all of the NFT information to the Mintlist. Due to transaction size limits on Solana, you can only add information for about 100 NFTs at a time so this process could take many transactions for a large Mintlist.

Once you've added all NFT information, the Mintlist will be in `Pre Sale` or `For Sale` based on the `go_live_date`.

After all NFTs have been minted (or redeemed), the Mintlist will be in `Sale Ended` and you can close the Mintlist to recover the SOL you paid for creating the Mintlist.

## Comparison to Metaplex's CandyMachine

The Mintlist is similar to [Metaplex's CandyMachine](https://docs.metaplex.com/candy-machine-v2/introduction) with a few differences:

1. Mintlists are cheaper than CandyMachines.
2. Mintlists always mint new NFTs into a collection. With CandyMachine, you need to follow an additional process to set up a collection.
3. You can [create a Mintlist](/mintlists/create) without any technical background. CandyMachine requires coding knowledge and using a terminal.

## Mintlist Schema

Each Mintlist is an account owned by the NFToken program. The Mintlist stores information about the NFTs that are available to mint along with the collection that they will be minted into.

{% attribute-table title="Mintlist Account Data" %}
{% attribute-row attribute="authority" type="Pubkey" %}
The account that is allowed to configure, update, and close the Mintlist.
{% /attribute-row %}
{% attribute-row attribute="price_lamports" type="u64" %}
The amount of SOL that each minter will be paying to receive a single NFT.
{% /attribute-row %}
{% attribute-row attribute="treasury_sol" type="Pubkey" %}
The account that will receive the payments each minter is making when they mint an NFT.
{% /attribute-row %}
{% attribute-row attribute="go_live_date" type="UnixTimestamp" %}
The date at which minters will be able to start minting NFTs. If you submit a transaction before the `go_live_date`, the transaction will fail.
{% /attribute-row %}
{% attribute-row attribute="minting_order" type="MintingOrder" %}
The order NFTs will be minted in.

`Sequential` - Each minter will receive next available NFT.
`Random` - Each minter will receive a random NFT. This uses a previous blockhash as a source for randomness.

{% /attribute-row %}
{% attribute-row attribute="collection" type="Pubkey" %}
The collection that NFTs will be minted into.
{% /attribute-row %}
{% attribute-row attribute="metadata_url" type="String" %}
This points to Metadata that can hold the name and image for the Mintlist. This adheres to the same offchain Metadata standard as NFTs.
{% /attribute-row %}
{% attribute-row attribute="num_nfts_total" type="u32" %}
This is total number of NFTs that will be available to mint once the Mintlist has been configured.
{% /attribute-row %}
{% attribute-row attribute="num_nfts_redeemed" type="u32" %}
If users have started minting, this will show the number of NFTs that have been minted from the list.
{% /attribute-row %}
{% attribute-row attribute="num_nfts_configured" type="u32" %}
This stores the number of NFTs that have been added to the Mintlist. The Mintlist will be ready once `num_nfts_configured == num_nfts_total`.
{% /attribute-row %}
{% attribute-row attribute="mint_infos" type="Array<MintInfo>" %}
This stores information about each NFT. Each NFT is defined by a `metadata_url`.
{% /attribute-row %}
{% /attribute-table %}
