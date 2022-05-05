use anchor_lang::prelude::*;
use crate::errors::*;
use crate::constants::*;
use crate::account_types::{NftAccount};

/// # Unset Collection
///
/// This updates an NFT to remove it from a collection.
///
/// This requires the following auth:
///
/// ## NFT
/// - `creator_can_update` = true
/// - `creator == nft_authority` - the `nft.creator` has to sign this TX
///
/// This does not require any auth on the collection, because the NFT creator should be
/// able to remove it from a collection even without consent of the collection authority.
///
/// In the future, we may want to allow the collection authority to remove NFTs from a collection
/// without auth from the NFT creator.
pub fn nft_unset_collection_inner(ctx: Context<NftUnsetCollection>) -> Result<()> {
    let nft_account = &mut ctx.accounts.nft;
    let nft_authority_key = ctx.accounts.nft_authority.key();

    let has_nft_auth = nft_account.creator.key() == nft_authority_key && nft_account.creator_can_update;
    require!(has_nft_auth, NftokenError::Unauthorized);

    nft_account.collection = NULL_PUBKEY;

    Ok(())
}

#[derive(Accounts)]
pub struct NftUnsetCollection<'info> {
    #[account(mut)]
    pub nft: Account<'info, NftAccount>,
    #[account(mut)] // This is also the fee payer for the TX
    pub nft_authority: Signer<'info>,
}
