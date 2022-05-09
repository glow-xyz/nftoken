use crate::account_types::{CollectionAccount, NftAccount};
use crate::errors::*;
use anchor_lang::prelude::*;

/// # Set Collection
///
/// This updates an NFT to be part of a collection.
///
/// This requires the following auth:
///
/// ## NFT
/// - `creator_can_update` = true
/// - `creator == nft_authority` - the `nft.creator` has to sign this TX
///
/// ## Collection
/// - `creator_can_update` = true
/// - `creator == collection_authority` - the `collection.creator` has to sign this TX
pub fn nft_set_collection_inner(ctx: Context<NftSetCollection>) -> Result<()> {
    let nft = &mut ctx.accounts.nft;
    let nft_authority_key = ctx.accounts.nft_authority.key();

    let has_nft_auth = nft.creator.key() == nft_authority_key && nft.creator_can_update;
    require!(has_nft_auth, NftokenError::Unauthorized);

    let collection_account = &ctx.accounts.collection;
    let collection_authority_key = ctx.accounts.collection_authority.key();

    let has_collection_auth = collection_account.creator.key() == collection_authority_key
        && collection_account.creator_can_update;
    require!(has_collection_auth, NftokenError::Unauthorized);

    nft.collection = collection_account.key();

    Ok(())
}

#[derive(Accounts)]
pub struct NftSetCollection<'info> {
    #[account(mut)]
    pub nft: Account<'info, NftAccount>,
    #[account(mut)] // This is also the fee payer for the TX
    pub nft_authority: Signer<'info>,

    pub collection: Account<'info, CollectionAccount>,
    pub collection_authority: Signer<'info>,
}
