use crate::account_types::NftAccount;
use crate::constants::*;
use crate::errors::*;
use anchor_lang::prelude::*;

/// # Unset Collection
///
/// This updates an NFT to remove it from a collection.
///
/// This requires the following auth:
///
/// ## NFT
/// - `authority_can_update` = true
/// - `authority == nft_authority` - the `nft.authority` has to sign this TX
///
/// This does not require any auth on the collection, because the NFT creator should be
/// able to remove it from a collection even without consent of the collection authority.
///
/// In the future, we may want to allow the collection authority to remove NFTs from a collection
/// without auth from the NFT creator.
pub fn nft_unset_collection_inner(ctx: Context<NftUnsetCollection>) -> Result<()> {
    let nft = &mut ctx.accounts.nft;
    let nft_authority_key = ctx.accounts.authority.key();

    let has_nft_auth = nft.authority.key() == nft_authority_key && nft.authority_can_update;
    require!(has_nft_auth, NftokenError::Unauthorized);

    nft.collection = NULL_PUBKEY;

    Ok(())
}

#[derive(Accounts)]
pub struct NftUnsetCollection<'info> {
    #[account(mut, has_one = authority)]
    pub nft: Account<'info, NftAccount>,

    // TODO: does this need to be mutable?
    #[account(mut)] // This is also the fee payer for the TX
    pub authority: Signer<'info>,
}
