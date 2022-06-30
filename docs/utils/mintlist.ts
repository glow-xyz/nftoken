import BN from "bn.js";

export function getMintlistAccountSize(numNftsTotal: number): BN {
  return new BN(
    // Account discriminator
    8 +
      // version
      1 +
      // creator
      32 +
      // treasury_sol
      32 +
      // go_live_date
      8 +
      // price
      8 +
      // minting_order
      1 +
      // collection
      32 +
      // metadata_url
      96 +
      // created_at
      8 +
      // num_mints
      4 +
      // mints_redeemed
      4 +
      // num_nfts_configured
      4 +
      // mint_infos
      numNftsTotal * getMintInfoSize()
  );
}

function getMintInfoSize(): number {
  return (
    // minted
    1 +
    // metadata_url
    96
  );
}
