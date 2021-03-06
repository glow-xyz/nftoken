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
/// - `authority_can_update` = true
/// - `authority == nft_authority` - the `nft.authority` has to sign this TX
///
/// ## Collection
/// - `authority_can_update` = true
/// - `authority == collection_authority` - the `collection.authority` has to sign this TX
pub fn nft_set_collection_inner(ctx: Context<NftSetCollection>) -> Result<()> {
    let nft = &mut ctx.accounts.nft;
    let nft_authority_key = ctx.accounts.nft_authority.key();

    let has_nft_auth = nft.authority.key() == nft_authority_key && nft.authority_can_update;
    require!(has_nft_auth, NftokenError::Unauthorized);

    let collection = &ctx.accounts.collection;
    let collection_authority_key = ctx.accounts.collection_authority.key();

    let has_collection_auth =
        collection.authority.key() == collection_authority_key && collection.authority_can_update;
    require!(has_collection_auth, NftokenError::Unauthorized);

    nft.collection = collection.key();

    Ok(())
}

#[derive(Accounts)]
pub struct NftSetCollection<'info> {
    #[account(mut)]
    pub nft: Account<'info, NftAccount>,
    pub nft_authority: Signer<'info>,

    pub collection: Account<'info, CollectionAccount>,
    pub collection_authority: Signer<'info>,
}
