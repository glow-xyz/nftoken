export function getMintlistAccountSize(numMints: number): number {
  return (
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
    // num_mints
    8 +
    // mints_redeemed
    8 +
    // minting_order
    1 +
    // collection
    32 +
    // created_at
    8 +
    // mint_infos
    // FIXME: When we figure out how to store the list of `MintInfo`'s, we might need to add the size of the container.
    numMints * getMintInfoSize()
  );
}

function getMintInfoSize(): number {
  return (
    // name
    32 +
    // image_url
    64 +
    // metadata_url
    64 +
    // minted
    1
  );
}
