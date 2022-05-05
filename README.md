# New Solana NFT Standard

## Current Issues

The current NFT spec is pretty bad for a few reasons:

- every NFT requires multiple accounts (3+)
- the token account address can change (and the token account is not always the associated token account of the current NFT owner)
- the NFT holder can transfer the NFT to a diff token account which can make any existing escrow / marketplace accounts invalid
- it’s hard to get all of the NFTs for a given wallet
- the editions part of the spec is very confusing
- it’s hard to group collections — not built into the original version of the spec and slow to query
- it’s really hard to get all of the activity (transfers / etc) for one NFT since one tx may include the mint while another tx includes the token account

This all stems from the first problem — an NFT is a bunch of different accounts but it should really be just one account.

## A Path Forwards

Read more here: https://lu.ma/p/CM0oovlwagtYho6/Proposal-New-Solana-NFT-Spec

---

Follow along: https://twitter.com/VictorPontis
